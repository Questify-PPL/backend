import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTopupDto } from 'src/dto/topup/createTopup.dto';
import { ValidateTopupDto } from 'src/dto/topup/validateTopup.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TopupService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllOnValidationInvoice() {
    const invoices = await this.prismaService.invoiceTopup.findMany({
      where: {
        status: 'Pending',
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get all on validation invoice',
      data: invoices,
    };
  }

  async createTopup(
    userId: string,
    type: string,
    createTopupDto: CreateTopupDto,
    buktiPembayaranUrl: string,
  ) {
    const { amount } = createTopupDto;
    if (type !== 'creator') {
      throw new BadRequestException('Type must be creator');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const invoice = await this.prismaService.invoiceTopup.create({
      data: {
        creatorId: userId,
        amount,
        buktiPembayaranUrl,
        status: 'Pending',
      },
    });

    return {
      statusCode: 201,
      message: 'Successfully create topup invoice',
      data: invoice,
    };
  }

  async validateTopup(
    invoiceId: string,
    type: string,
    validateTopupDto: ValidateTopupDto,
  ) {
    if (type !== 'admin') {
      throw new BadRequestException('Type must be an admin');
    }

    const { isValidated } = validateTopupDto;

    const invoice = await this.prismaService.invoiceTopup.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status !== 'Pending') {
      throw new BadRequestException('Invoice already validated');
    }

    const status = isValidated ? 'Validated' : 'Rejected';

    if (isValidated) {
      await this.addCreditsToCreator(invoice);
    }

    const updatedInvoice = await this.prismaService.invoiceTopup.update({
      where: { id: invoiceId },
      data: { status, validatedAt: new Date() },
    });

    return {
      statusCode: 200,
      message: 'Successfully validate invoice',
      data: updatedInvoice,
    };
  }

  private async addCreditsToCreator(invoice: {
    id: string;
    creatorId: string;
    amount: number;
    status: string;
    buktiPembayaranUrl: string;
    createdAt: Date;
    validatedAt: Date;
  }) {
    const userId = invoice.creatorId;

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const newCredit = (user.credit ?? 0) + invoice.amount;

    await this.prismaService.user.update({
      where: { id: userId },
      data: { credit: newCredit },
    });
  }

  async getOwnedTopupInvoice(userId: string) {
    const invoices = await this.processInvoicesForCreator(userId);

    return {
      statusCode: 200,
      message: 'Successfully get invoice as creator',
      data: invoices,
    };
  }

  private async processInvoicesForCreator(userId: string) {
    const invoices = await this.prismaService.invoiceTopup.findMany({
      where: {
        creatorId: userId,
      },
    });

    const invoicesWithStats = invoices.map(async (invoice) => {
      return {
        ...invoice,
      };
    });

    return Promise.all(invoicesWithStats);
  }
}
