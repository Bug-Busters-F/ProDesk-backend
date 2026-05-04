import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './modules/Messages/message.module';
import { ChatModule } from './modules/chat/chat.module';
import { TriageModule } from './modules/triage/triage.module';
import { CategoryModule } from './modules/category/category.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { EmailModule } from './modules/email/email.module';
import { FileModule } from './modules/file/file.module';
import { FaqModule } from './modules/faq/faq.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads', 
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    CompanyModule,
    MongooseModule.forRoot(process.env.MONGO_URI!),
    MessageModule,
    ChatModule,
    TriageModule,
    CategoryModule,
    TicketModule,
    EmailModule,
    FileModule,
    FaqModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}