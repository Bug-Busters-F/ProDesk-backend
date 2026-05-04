import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FaqSchema, FaqSchemaClass } from "./infra/schemas/faq.mongo.schema";
import { FaqController } from "./presentation/controllers/faq.controller";
import { IFaqRepository } from "./domain/repository/faq.repository.interface";
import { FaqMongoRepository } from "./infra/repositories/faq.mongodb.repository";
import { CreateFaqUseCase } from "./application/create/create.usecase";
import { UpdateFaqUseCase } from "./application/update/update.usecase";
import { DeleteFaqUseCase } from "./application/delete/delete.usecase";
import { ReadAllFaqUseCase } from "./application/readAll/readAll.usecase";
import { ReadByIdFaqUseCase } from "./application/readById/readById.usecase";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: FaqSchemaClass.name, schema: FaqSchema }]),
    ],
    controllers: [FaqController],
    providers: [
        { provide: IFaqRepository, useClass: FaqMongoRepository },
        CreateFaqUseCase,
        UpdateFaqUseCase,
        DeleteFaqUseCase,
        ReadAllFaqUseCase,
        ReadByIdFaqUseCase
    ],
})
export class FaqModule {}