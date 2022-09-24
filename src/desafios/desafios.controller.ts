import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DesafiosService } from './desafios.service';
import { Desafio } from './interfaces/desafio.interface';

const ackErrors: string[] = ['E11000'];

@Controller('desafios')
export class DesafiosController {
  constructor(private readonly desafiosService: DesafiosService) {}

  @EventPattern('criar-desafio')
  async criarDesafio(@Payload() desafio: Desafio, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await channel.ack(originalMsg);
      await this.desafiosService.criarDesafio(desafio);
    } catch (error) {
      console.log('error:', error);
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-desafios')
  async consultarDesafios(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<Desafio[] | Desafio> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const { idJogador, _id } = data;
      console.log(`data: ${JSON.stringify(data)}`);
      if (idJogador) {
        return await this.desafiosService.consultarDesafiosDeUmJogador(
          idJogador,
        );
      } else if (_id) {
        return await this.desafiosService.consultarDesafioPeloId(_id);
      } else {
        return await this.desafiosService.consultarTodosDesafios();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @MessagePattern('consultar-desafios-realizados')
  async consultarDesafiosRealizados(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ): Promise<Desafio[] | Desafio> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { idCategoria, dataRef } = payload;
      if (dataRef) {
        return await this.desafiosService.consultarDesafiosRealizadosPelaData(
          idCategoria,
          dataRef,
        );
      } else {
        return await this.desafiosService.consultarDesafiosRealizados(
          idCategoria,
        );
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('atualizar-desafio')
  async atualizarDesafio(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      console.log(`data: ${JSON.stringify(data)}`);
      const _id: string = data.id;
      const desafio: Desafio = data.desafio;
      await this.desafiosService.atualizarDesafio(_id, desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('atualizar-desafio-partida')
  async atualizarDesafioPartida(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      console.log(`idPartida: ${data}`);
      const idPartida: string = data.idPartida;
      const desafio: Desafio = data.desafio;
      await this.desafiosService.atualizarDesafioPartida(idPartida, desafio);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('deletar-desafio')
  async deletarDesafio(
    @Payload() desafio: Desafio,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.desafiosService.deletarDesafio(desafio);
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
