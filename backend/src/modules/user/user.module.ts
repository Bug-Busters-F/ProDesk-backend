import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { CompanyModule } from '../company/company.module';
import { CategoryModule } from '../category/category.module';
import { AccessRequestSchema } from './accessRequest.schema';
import { EmailModule } from '../email/email.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'AccessRequest', schema: AccessRequestSchema }]),
    CompanyModule,
    CategoryModule,
    EmailModule,
    SharedModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
