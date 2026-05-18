import {
    Injectable,
    MessageEvent,
} from "@nestjs/common";

import { Subject } from "rxjs";

@Injectable()
export class NotificationStreamService {

    /**
     * Armazena um canal de comunicação (stream)
     * para cada usuário conectado.
     *
     * Estrutura:
     * userId -> Subject<MessageEvent>
     */
    private readonly streams = new Map<
        string,
        Subject<MessageEvent>
    >();

    /**
     * Retorna o stream do usuário.
     *
     * Caso o usuário ainda não tenha um stream,
     * cria um novo.
     */
    getStream(userId: string): Subject<MessageEvent> {

        if (!this.streams.has(userId)) {

            /**
             * Cria um novo Subject.
             *
             * Subject funciona como um canal
             * que envia eventos em tempo real.
             */
            this.streams.set(
                userId,
                new Subject<MessageEvent>(),
            );
        }

        return this.streams.get(userId)!;
    }

    /**
     * Envia uma notificação para um usuário.
     */
    send(userId: string, payload: any) {

        const stream = this.streams.get(userId);


        if (!stream) return;

        /**
         * next() envia um evento para todos
         * que estiverem ouvindo esse stream.
         */
        stream.next({
            data: payload,
        });
    }

    removeStream(userId: string) {

        const stream = this.streams.get(userId);

        if (!stream) return;

        stream.complete();

        this.streams.delete(userId);
    }
}