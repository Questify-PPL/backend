import { Injectable } from '@nestjs/common';
import { Form, Participation, PrizeType, Respondent } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PityService {
  constructor(private readonly prismaService: PrismaService) {}

  /*
    Note: processWinner, computeWinningChance, and updatePityAfterParticipation, will be
    called from form.service.ts after PBI-14-PenyebaranHadiahKuesioner has been implemented.
  */

  async processWinner(form: Form & { Participation: Participation[] }) {
    const { prizeType, maxWinner, Participation, endedAt, isWinnerProcessed } =
      form;

    if (endedAt === null || endedAt >= new Date() || isWinnerProcessed) {
      return;
    }

    const respondentIds = Participation.map(
      (participation) => participation.respondentId,
    );

    if (respondentIds.length !== 0 && maxWinner !== 0) {
      if (prizeType === PrizeType.EVEN) {
        // PBI-14-PenyebaranHadiahKuesioner
        this.updatePityAndCreditsForEven(respondentIds);
      } else {
        const winnerIds: string[] = await this.randomPickWithWeights(
          maxWinner,
          respondentIds,
        );
        // PBI-14-PenyebaranHadiahKuesioner
        this.updatePityAndCreditsForLucky(winnerIds);
      }
    }

    // PBI-14-PenyebaranHadiahKuesioner
    // UPDATE form.isWinnerProcessed (true)
    return;
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

  private async randomPickWithWeights(maxWinner: number, respondentIds: string[]) {
    if (respondentIds.length <= maxWinner) {
      return respondentIds;
    }

    let respondents = await this.prismaService.respondent.findMany({
      where: {
        userId: {
          in: respondentIds,
        },
      },
    });

    let { prefixSum, totalSum } = this.calculateSum(respondents);
    const winnerIds: string[] = [];

    // Random pick K winners
    for (let i = 0; i < maxWinner; i++) {
      const numberOfWinners = i;
      const target = totalSum * Math.random();

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
    const totalSum = sum;

    return { prefixSum, totalSum };
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

  private async updatePityAndCreditsForEven(respondentIds: string[]) {
    // UPDATE ALL users' credit (credit += prize / Participation.length)
    // UPDATE ALL participation.finalWinningChance (100)
    // NO changes for users' pity
  }

  private async updatePityAndCreditsForLucky(winnerIds: string[]) {
    // UPDATE ALL winners' credit (credit += prize / winners.length)
    // UPDATE ALL participation.finalWinningChance
    // UPDATE ALL users' (winners and non-winners) pity
  }
}
