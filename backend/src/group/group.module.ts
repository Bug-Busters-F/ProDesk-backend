import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: "Group", schema: UserSchema}])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
