import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { GroupModule } from './modules/group/group.module';
import { CompanyModule } from './modules/company/company.module';
import { MongooseModule } from '@nestjs/mongoose';  
import { MessageModule } from './modules/Messages/message.module';
import { ChatModule } from './modules/chat/chat.module';
import { TriageModule } from './modules/triage/triage.module';
import { CategoryModule } from './modules/category/category.module';
import { TicketModule } from './modules/ticket/ticket.module';

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
    MongooseModule.forRoot(process.env.MONGO_URI!),
    MessageModule,
    ChatModule,
    TriageModule,
    CategoryModule,
    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
