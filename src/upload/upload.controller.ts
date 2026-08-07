import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AuthGuard } from '@nestjs/passport';

const storageOptions = diskStorage({
  destination: './uploads/products',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + extname(file.originalname).toLowerCase());
  },
});

const fileFilterOptions = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|heic)$/i)) {
    return cb(new BadRequestException('Seuls les formats d\'images (JPG, JPEG, PNG, WEBP) sont acceptés'), false);
  }
  cb(null, true);
};

@Controller('upload')
export class UploadController {
  // Upload d'une seule image HD/4K (jusqu'à 15MB)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: storageOptions,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB pour supporter la 4K / UHD
    fileFilter: fileFilterOptions,
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return { 
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // Upload multiple (Galerie jusqu'à 10 photos simultanées 4K/UHD)
  @UseGuards(AuthGuard('jwt'))
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: storageOptions,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: fileFilterOptions,
  }))
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));
  }
}
