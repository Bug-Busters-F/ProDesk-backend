import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from './group.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: "Group", schema: GroupSchema}])],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
