import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '../../shared/enums/notification.enum';
import { UserService } from '../../../user/user.service';
import { CreateNotificationUseCase } from '../use-cases/create-notification.use-case';
import { NotificationStreamService } from '../services/notificatio.stream.service';
import { UserRole } from '../../../shared/enums/user.enum';
import { AccessRequestEvent } from '../../../../../shared/events/access-request.event';

@Injectable()
export class AccessRequestListener {
  constructor(
    private readonly userService: UserService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly notificationStreamService: NotificationStreamService,
  ) {}

  @OnEvent(NotificationType.ACCESS_REQUEST)
  async handle(event: AccessRequestEvent) {
    console.log('[AccessRequestListener] Evento recebido:', event);

    // Buscar todos os administradores
    const admins = await this.userService.findAll(1, 1000, { role: UserRole.ADMIN });
    if (!admins.data.length) return;

    await Promise.all(
      admins.data.map(async (admin) => {
        const notification = await this.createNotificationUseCase.execute({
          title: 'Nova solicitação de acesso',
          message: 'Um novo usuário solicitou acesso ao sistema',
          clientId: '',
          supportAgentId: admin.id,
          type: NotificationType.ACCESS_REQUEST,
        });
        this.notificationStreamService.send(admin.id, notification.toPrimitives());
      })
    );
  }
}
