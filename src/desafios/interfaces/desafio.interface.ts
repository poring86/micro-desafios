import { DesafioStatus } from '../desafio-status.enum';

export interface Desafio {
  dataHoraDesafio: Date;
  status: DesafioStatus;
  dataHoraSolicitacao: Date;
  dataHoraResposta: Date;
  categoria: string;
  jogadores: string[];
}
