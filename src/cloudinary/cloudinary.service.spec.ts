import { Test } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import * as cloudinary from 'cloudinary';
import { Readable } from 'stream';

// Mock the cloudinary module
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

// Mock the buffer-to-stream module
jest.mock('buffer-to-stream', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = moduleRef.get<CloudinaryService>(CloudinaryService);
  });

  it('should upload an image', async () => {
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (options, callback) => {
        const mockStream = new Readable();
        mockStream.pipe = jest.fn();
        callback(null, { success: true });
        return mockStream;
      },
    );

    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const result = await service.uploadImage(mockFile);

    expect(result).toEqual({ success: true });
    expect(cloudinary.v2.uploader.upload_stream).toHaveBeenCalled();
  });

  it('should throw an error if the upload fails', async () => {
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (options, callback) => {
        callback(new Error('Upload failed'), null);
      },
    );

    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    await expect(service.uploadImage(mockFile)).rejects.toThrow(
      'Upload failed',
    );
  });

  it('should upload a bukti_bayar', async () => {
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (options, callback) => {
        const mockStream = new Readable();
        mockStream.pipe = jest.fn();
        callback(null, { success: true });
        return mockStream;
      },
    );

    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const result = await service.uploadBuktiPembayaran(mockFile);

    expect(result).toEqual({ success: true });
    expect(cloudinary.v2.uploader.upload_stream).toHaveBeenCalled();
  });

  it('should throw an error if the upload fails', async () => {
    (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementationOnce(
      (options, callback) => {
        callback(new Error('Upload failed'), null);
      },
    );

    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    await expect(service.uploadBuktiPembayaran(mockFile)).rejects.toThrow(
      'Upload failed',
    );
  });
});
