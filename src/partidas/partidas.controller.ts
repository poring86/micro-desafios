import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Partida } from './interfaces/partida.interface';
import { PartidasService } from './partidas.service';

const ackErrors: string[] = ['E11000'];

@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @EventPattern('criar-partida')
  async criarPartida(@Payload() partida: Partida, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      console.log(`partida: ${JSON.stringify(partida)}`);
      await this.partidasService.criarPartida(partida);
      await channel.ack(originalMsg);
    } catch (error) {
      console.log(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }
}
