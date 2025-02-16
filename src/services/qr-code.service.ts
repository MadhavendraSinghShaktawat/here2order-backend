import { Storage } from '@google-cloud/storage';
import QRCode from 'qrcode';
import { CONSTANTS } from '@/config/constants';
import fs from 'fs';
import path from 'path';

class QRCodeService {
  private static storage: Storage | null = null;
  private static bucket: any = null;
  private static localStoragePath = path.join(process.cwd(), 'uploads', 'qr-codes');

  private static initializeStorage() {
    try {
      if (CONSTANTS.GOOGLE_CLOUD.PROJECT_ID && 
          CONSTANTS.GOOGLE_CLOUD.KEY_FILE && 
          CONSTANTS.GOOGLE_CLOUD.BUCKET_NAME) {
        this.storage = new Storage({
          keyFilename: CONSTANTS.GOOGLE_CLOUD.KEY_FILE,
          projectId: CONSTANTS.GOOGLE_CLOUD.PROJECT_ID
        });
        this.bucket = this.storage.bucket(CONSTANTS.GOOGLE_CLOUD.BUCKET_NAME);
      }
      
      // Ensure local storage directory exists
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    } catch (error) {
      console.warn('Google Cloud Storage initialization failed, using local storage:', error);
    }
  }

  private static async generateQRCode(data: string): Promise<Buffer> {
    return QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      width: 300
    });
  }

  public static async generateAndUploadQRCode(
    restaurantId: string,
    tableId: string,
    tableNumber: string
  ): Promise<string> {
    if (!this.storage) {
      this.initializeStorage();
    }

    // Generate QR code data URL
    const orderUrl = `${CONSTANTS.FRONTEND_URL}/restaurant/${restaurantId}/table/${tableId}`;
    const qrCodeBuffer = await this.generateQRCode(orderUrl);

    try {
      if (this.bucket) {
        // Upload to Google Cloud Storage
        const fileName = `qr-codes/${restaurantId}/${tableNumber}.png`;
        const file = this.bucket.file(fileName);

        await file.save(qrCodeBuffer, {
          metadata: {
            contentType: 'image/png'
          }
        });

        await file.makePublic();
        return `https://storage.googleapis.com/${CONSTANTS.GOOGLE_CLOUD.BUCKET_NAME}/${fileName}`;
      } else {
        // Store locally
        const localFilePath = path.join(this.localStoragePath, restaurantId);
        if (!fs.existsSync(localFilePath)) {
          fs.mkdirSync(localFilePath, { recursive: true });
        }

        const fileName = `${tableNumber}.png`;
        const filePath = path.join(localFilePath, fileName);
        await fs.promises.writeFile(filePath, qrCodeBuffer);

        // Return local URL
        return `/uploads/qr-codes/${restaurantId}/${fileName}`;
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw new Error('Failed to save QR code');
    }
  }

  public static async deleteQRCode(restaurantId: string, tableNumber: string): Promise<void> {
    if (!this.storage) {
      this.initializeStorage();
    }

    try {
      if (this.bucket) {
        const fileName = `qr-codes/${restaurantId}/${tableNumber}.png`;
        const file = this.bucket.file(fileName);
        await file.delete();
      } else {
        const filePath = path.join(this.localStoragePath, restaurantId, `${tableNumber}.png`);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  }
}

export { QRCodeService }; 