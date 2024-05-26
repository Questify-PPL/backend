import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto, UpdateReportDto, FindQueryDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportStatus, User } from '@prisma/client';

export const totalAcceptedReportForBanned = 5;

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: User, createReportDto: CreateReportDto) {
    const reportExist = await this.prismaService.report.findFirst({
      where: {
        fromUserId: user.id,
        toUserId: createReportDto.reportToId,
        formId: createReportDto.formId,
      },
    });

    if (reportExist) {
      throw new BadRequestException('You have reported this user before');
    }

    const report = await this.prismaService.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          fromUserId: user.id,
          toUserId: createReportDto.reportToId,
          formId: createReportDto.formId,
          message: createReportDto.message,
        },
      });

      const creatorIsReported = await this.creatorIsReported(
        createReportDto.reportToId,
        createReportDto.formId,
      );

      if (creatorIsReported) {
        await tx.participation.update({
          where: {
            respondentId_formId: {
              formId: createReportDto.formId,
              respondentId: user.id,
            },
          },
          data: { formIsReported: true },
        });
      } else {
        await tx.participation.update({
          where: {
            respondentId_formId: {
              formId: createReportDto.formId,
              respondentId: createReportDto.reportToId,
            },
          },
          data: { respondentIsReported: true },
        });
      }

      return report;
    });

    return report;
  }

  async creatorIsReported(creatorId: string, formId: string) {
    const isReported = await this.prismaService.form.findFirst({
      where: {
        creatorId,
        id: formId,
      },
    });

    return isReported !== null;
  }

  async findAll(query: FindQueryDto = {}) {
    const reports = await this.prismaService.report.findMany({
      where: {
        status: query.status,
        toUserId: query.toUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roles: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roles: true,
            _count: {
              select: {
                ReportTo: {
                  where: {
                    status: ReportStatus.APPROVED,
                  },
                },
              },
            },
          },
        },
        form: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });
    return reports;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const currentReport = await this.prismaService.report.findUnique({
      where: {
        id,
      },
    });

    if (!currentReport) {
      throw new NotFoundException('The report not found');
    }

    if (currentReport.status !== ReportStatus.PENDING) {
      throw new BadRequestException('The report has been approved/rejected');
    }

    const updatedReport = await this.prismaService.$transaction(async (tx) => {
      const report = await tx.report.update({
        where: {
          id,
        },
        data: {
          status: updateReportDto.isApproved
            ? ReportStatus.APPROVED
            : ReportStatus.REJECTED,
        },
      });

      if (report.status === ReportStatus.APPROVED) {
        // Check total approved reports from reported respondent
        const [{ count }] = await tx.$queryRaw<{ count: number }[]>`
          select count(*)
          from "Report" R
                  join "Participation" P on R."toUserId" = P."respondentId" and R."formId" = P."formId"
          where R.status = 'APPROVED'
            and R."toUserId" = ${report.toUserId};
        `;

        // Check for banning user
        if (count >= totalAcceptedReportForBanned) {
          await tx.user.update({
            where: {
              id: report.toUserId,
            },
            data: {
              isBlocked: true,
            },
          });
        }
      }

      return report;
    });

    return updatedReport;
  }
}
