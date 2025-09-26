// Temporary workaround for TypeScript compiler bug with Commander overloads
import { Command as BaseCommand } from 'commander';

export class Command extends BaseCommand {
  constructor(name?: string) {
    super();
    if (name) {
      this.name(name);
    }
  }
}

export { BaseCommand };