
export class AccessRequestEvent {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly cnpj: string,
  ) {}
}
