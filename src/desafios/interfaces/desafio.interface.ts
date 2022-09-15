import { DesafioStatus } from '../desafio-status.enum';

export interface Desafio {
  _id: any;
  partida: string;
  dataHoraDesafio: Date;
  status: DesafioStatus;
  dataHoraSolicitacao: Date;
  dataHoraResposta: Date;
  categoria: string;
  jogadores: string[];
}
