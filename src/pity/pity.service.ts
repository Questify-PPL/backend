import { Injectable } from '@nestjs/common';
import { Form, Participation, PrizeType, Respondent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class PityService {
  constructor(private readonly prismaService: PrismaService) {}

  async processWinner(form: Form & { Participation: Participation[] }) {
    const {
      id: formId,
      prize,
      prizeType,
      maxWinner,
      Participation,
      endedAt,
      isWinnerProcessed,
      totalPity,
    } = form;

    if (endedAt === null || endedAt >= new Date() || isWinnerProcessed) {
      return;
    }

    const respondentIds = Participation.filter(
      (participation) => participation.isCompleted,
    ).map((participation) => participation.respondentId);

    let winnerIds: string[] = [];

    if (respondentIds.length !== 0 && maxWinner !== 0) {
      if (prizeType === PrizeType.EVEN) {
        winnerIds = respondentIds;
        await this.updatePityAndCreditsForEven(prize, winnerIds, formId);
      } else {
        winnerIds = await this.randomPickWithWeights(maxWinner, respondentIds);
        await this.updatePityAndCreditsForLucky(
          prize,
          winnerIds,
          respondentIds,
          formId,
          totalPity,
        );
      }
    }

    await this.markWinnerProcessed(formId);

    return winnerIds;
  }

  private async markWinnerProcessed(formId: string) {
    await this.prismaService.form.update({
      where: {
        id: formId,
      },
      data: {
        isWinnerProcessed: true,
      },
    });
  }

  calculateWinningChance(
    respondent: Respondent,
    form: Form,
    isCompleted: boolean,
    finalWinningChance: number,
  ) {
    const { pity: respondentPity } = respondent;
    const { totalPity, prizeType, isWinnerProcessed } = form;

    if (isWinnerProcessed) {
      return finalWinningChance;
    }

    if (prizeType === PrizeType.EVEN) {
      return 100;
    }

    const divisor = isCompleted ? totalPity : respondentPity + totalPity;

    return divisor === 0 ? 100 : (respondentPity / divisor) * 100;
  }

  async updatePityAfterParticipation(formId: string, userId: string) {
    await this.prismaService.$transaction(async (prisma) => {
      const updatedUser = await prisma.respondent.update({
        where: {
          userId,
        },
        data: {
          pity: {
            increment: 1,
          },
        },
      });

      await prisma.form.update({
        where: {
          id: formId,
        },
        data: {
          totalPity: {
            increment: updatedUser.pity - 1,
          },
        },
      });

      await prisma.form.updateMany({
        where: {
          NOT: {
            id: formId,
          },
          Participation: {
            some: {
              respondentId: userId,
              isCompleted: true,
            },
          },
          isWinnerProcessed: false,
        },
        data: {
          totalPity: {
            increment: 1,
          },
        },
      });
    });
  }

  private async randomPickWithWeights(
    maxWinner: number,
    respondentIds: string[],
  ) {
    if (respondentIds.length <= maxWinner) {
      return respondentIds;
    }

    const respondents = await this.prismaService.respondent.findMany({
      where: {
        userId: {
          in: respondentIds,
        },
      },
    });

    const { prefixSum, sum } = this.calculateSum(respondents);
    const winnerIds: string[] = [];
    let totalSum = sum;

    // Random pick K winners
    for (let i = 0; i < maxWinner; i++) {
      const numberOfWinners = i;
      const target = totalSum * this.generateRandomValue();

      const winnerIndex = this.findWinnerIndex(
        prefixSum,
        target,
        numberOfWinners,
      );

      winnerIds.push(respondentIds[winnerIndex]);

      // Recalculate sum for subsequent random pick
      if (numberOfWinners + 1 < maxWinner) {
        totalSum = this.recalculateSum(
          prefixSum,
          numberOfWinners + 1,
          winnerIndex,
          respondentIds,
          respondents,
        );
      }
    }

    return winnerIds;
  }

  private generateRandomValue() {
    return randomBytes(4).readUInt32LE(0) / 0x100000000;
  }

  private findWinnerIndex(
    prefixSum: number[],
    target: number,
    numberOfWinners: number,
  ) {
    let left = 0;
    let right = prefixSum.length - numberOfWinners - 1;

    while (left < right) {
      const mid = left + Math.floor((right - left) / 2);
      if (prefixSum[mid] < target) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  private calculateSum(respondents: Respondent[]) {
    const prefixSum: number[] = [];
    let sum = 0;
    for (const respondent of respondents) {
      sum += respondent.pity;
      prefixSum.push(sum);
    }

    return { prefixSum, sum };
  }

  private recalculateSum(
    prefixSum: number[],
    numberOfWinners: number,
    winnerIndex: number,
    respondentIds: string[],
    respondents: Respondent[],
  ) {
    let newSum = winnerIndex === 0 ? 0 : prefixSum[winnerIndex - 1];

    for (let i = winnerIndex; i < prefixSum.length - numberOfWinners; i++) {
      const respondent = respondents[i + 1];
      newSum += respondent.pity;
      prefixSum[i] = newSum;
      respondents[i] = respondent;
      respondentIds[i] = respondentIds[i + 1];
    }

    return newSum;
  }

  private async updatePityAndCreditsForEven(
    prize: number,
    winnerIds: string[],
    formId: string,
  ) {
    const winnerCount = winnerIds.length;

    await this.prismaService.$transaction(async (prisma) => {
      // Update credits for winners
      await prisma.user.updateMany({
        where: {
          id: {
            in: winnerIds,
          },
        },
        data: {
          credit: {
            increment: prize / winnerCount,
          },
        },
      });

      // Update finalWinningChance for respondents' participation of the form
      await prisma.participation.updateMany({
        where: {
          respondentId: {
            in: winnerIds,
          },
          formId: formId,
        },
        data: {
          finalWinningChance: 100,
        },
      });

      // Create winners for the form
      await prisma.winner.createMany({
        data: winnerIds.map((winnerId) => ({
          respondentId: winnerId,
          formId: formId,
        })),
      });
    });
  }

  private async updatePityAndCreditsForLucky(
    prize: number,
    winnerIds: string[],
    respondentIds: string[],
    formId: string,
    totalPity: number,
  ) {
    const winnerCount = winnerIds.length;

    await this.prismaService.$transaction(async (prisma) => {
      // Update credits for winners
      await prisma.user.updateMany({
        where: {
          id: {
            in: winnerIds,
          },
        },
        data: {
          credit: {
            increment: prize / winnerCount,
          },
        },
      });

      // Update finalWinningChance for each respondent's participation of the form
      const respondents = await prisma.respondent.findMany({
        where: {
          userId: {
            in: respondentIds,
          },
        },
      });

      for (const respondent of respondents) {
        await prisma.participation.update({
          where: {
            respondentId_formId: {
              formId: formId,
              respondentId: respondent.userId,
            },
          },
          data: {
            finalWinningChance: (respondent.pity / totalPity) * 100,
          },
        });
      }

      // Update pity for winners and non-winners
      await prisma.respondent.updateMany({
        where: {
          userId: {
            in: winnerIds,
          },
        },
        data: {
          pity: 1,
        },
      });

      await prisma.respondent.updateMany({
        where: {
          userId: {
            in: respondentIds.filter((id) => !winnerIds.includes(id)),
          },
        },
        data: {
          pity: {
            increment: 2,
          },
        },
      });

      // Create winners for the form
      await prisma.winner.createMany({
        data: winnerIds.map((winnerId) => ({
          respondentId: winnerId,
          formId: formId,
        })),
      });
    });
  }
}
