import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { GroupModule } from './modules/group/group.module';
import { CompanyModule } from './modules/company/company.module';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    GroupModule,
    CompanyModule,
    MongooseModule.forRoot(process.env.MONGO_URI!)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
