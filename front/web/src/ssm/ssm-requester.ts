import { Machine } from "../domain/machine";
import {Session, SessionLog} from "../domain/session";
import {User} from "../domain/user";
import {ssmRegister} from "./ssm-api";
import {bccHostCmd} from "./bcc-xmlhttp";

export const fetchMachines = async () : Promise<Machine[]> => {
  const sessions = await fetchSessions();
  const json :string[] = await fetchCoop("query", "list", "ssm");
  const machines =  json.map( name => fetchMachine(name, sessions));
  return Promise.all(machines);
};

export  const fetchMachine = async (machineName: string, sessions: Session[]) : Promise<Machine> => {
  const machine :Machine = await fetchCoop( "query", "ssm", machineName);
  machine.sessions = sessions.filter(session => ifFromMachine(session, machine));
  return machine;
};

export  const ifFromMachine = (session: Session, machine: Machine) =>  {
  return (session.ssm === machine.name);
};

export  const fetchSessions = async () : Promise<Session[]> => {
  const json :string[] = await fetchCoop("query", "list", "session");
  return Promise.all(json.map(fetchSession))
};

export  const fetchSession = async (session: string) : Promise<Session> => {
  return fetchCoop("query", "session", session);
};

export  const fetchSessionLogs = async (session: string) : Promise<SessionLog[]> => {
  return fetchCoop("query", "log", session);
};

export  const fetchCoop = async ( cmd: String, fcn: String, args: String) : Promise<any> => {
  const response = await fetch(`${process.env.COOP_URL}?args=${args}&cmd=${cmd}&fcn=${fcn}`);
  return response.json();
};

export const fetchUsers = async () : Promise<User[]> => {
  const json :string[] = await fetchCoop("query", "list", "user");
  return Promise.all(json.map(fetchUser))
};

export  const fetchUser = async (userName: string) : Promise<User> => {
  return fetchCoop("query", "user", userName);
};

export const createUser = async (user: User) : Promise<string> => {
  return new Promise((resolve, reject) => {
    let args = ssmRegister(user,'adam', ADAM_PRIV);
    let onOk = (message: string)=> {
      resolve(message);
    };
    let onError = (message: string)=> {
      reject(message);
    };
    bccHostCmd(`${process.env.COOP_URL}`, args.cmd, args.fcn, args.args, onOk, onError);
  });
};

// TODO this is the adam private key from bclan-it, this is for test porpuse, DO NOT use this in production :)
const ADAM_PRIV = `MIIEowIBAAKCAQEAnLrQMxbv9oNe/Ej4k3SqGtdmb1K/qKJyAlPZIEEJoTmQOluk
  eLXHzLnVfZw1kptFphnNt93yFLi4/R/nC1mtNgQZQj3fdwSdYBaiyawP9RiLA8I6
  LRJLdYNcKVyrgsRsVnNppKbhjzG54PkMmMFI4Jm7dKuCIF2IRBe9KTjwujXvCV2J
  qg3CJUTvb9899PBaeqmADlIt5bSH9WnPkkFtRaMIKbhL2CnMg7TYCeDA8V0FU6E0
  lLBIkxe81GxhSVtTYVSdy5kM6N9VKWhGHzzEvtuJylfDXz5MUt7I3tUaRGqaLxCt
  LAdwIK2E2PS4dykLEoXQcboqC95AvW1JXxngzQIDAQABAoIBAQCMK9QK7Ue97C5m
  agjPMDb2fJDjnVlGQ8q9ZCo7W492PxpL5yxIvSMtaUKT7cJIFVCMRmWjPP/GIpNn
  50Fm+FQejDne8aFLO7hYeMYsohM/fCzQNsR7DPKp7creP0AxWuUdyGjCVnJC9BEv
  MO5gK/W20idCKCXgNmapp6WJGaDKmA2Ayn0gNnVqWbHvVGCy5dosCddkYZ7j3L19
  qPIVJs6N835rJRzBdyhss+btSrdtzeutmqGvctVKneOx8s4N88p/6yYFAWQanjwf
  BVjJTBD6wyMC+9Hj9sbLaNqMSY85aMAZ4wUoKbWbdRn1mqNZ+1EQpjtxEqS8OnWs
  gTYhRtMBAoGBAM1+GqrOFDz6vL38L5dboEVphlzLqrD1bT1Ocdhhe/oDsU61ImfP
  JNYJXF8Up6gT4ZA+reJEClDjODrsov1rCeC727TS5LN6ptBv4FhqFkeeS2j2ygDX
  f47kjEOe/OQV+4hIK9pbuFTB3KVOtrQC3TZDkTnC90meX5f2TeA5CstBAoGBAMNA
  eolP0JjbM8Uc2PbOC5JBwNi/YpDM63TMUZYN0DEHI2Mc/8M5Gl+YJP9ImAz4RrG6
  fbjHgbwbLj3K+/02cc0gpBxNuReUaO0SGaIyeu1PgXwLOW0DUedsxxn9DMc56GIO
  7DNCSqufsIrLz5c8DSI7y6aAOmXTEUtRw9K2Um6NAoGAEMjREsx8WLK+QeJcXMeO
  Ir1IzUGRcpzJTG2g3OSxhK1SiTRAWCxSPO1MzzNXsmHVVbvY5hdapFq62A1GDt70
  UpfljTKAnaxR/cp1j6MyqKzkSfGGdGUltR0z274bt+GXxvzmIBLHzpx7EkGIqNFn
  EiyYqxgirK+z7SygFcVy/UECgYA549kw8xgu6fcMf0QY0Ph/Ub2CxiPMOOWqyJV7
  /vZ2Qt6MGWH/mOOn6i01/2kNl2MmeNujuItPoWNxcMiLx+Ov5PijZ6v0QM1nVNGC
  1KK7z7HdfFp3Zt+W1RqnKu7p9tJemHwRqpsHDZ7DWDBhb62ZM89qu2QVIqJjCYgc
  5m/EVQKBgBDOnJuzzGcMmbz1iL2Jv2pK0xuGuaH82cV5LkArL6+fUIRSMJD33n0R
  IhOTYyG7uk+Rn6t91/BpbwEAAPTeqWUFYhZqsl8FBd1VGBB9Je1MYdQud8LKryxR
  Sqpz7Z0g9ivaJUEMgnSHrqKmgIE9daS2MlXdYCZjpsn1czA3IZ6o`;
