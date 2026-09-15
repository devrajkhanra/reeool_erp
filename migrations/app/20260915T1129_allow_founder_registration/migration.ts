#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/03bd572ae289f172a6a2728601a7f24d462e09df21d903621fed467390ccd574/contract';
import startContract from '../../snapshots/03bd572ae289f172a6a2728601a7f24d462e09df21d903621fed467390ccd574/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/be8f73396e425e0a5eebd2eee861d8b939aaf3512e4a5dd9762372afb879a458/contract';
import endContract from '../../snapshots/be8f73396e425e0a5eebd2eee861d8b939aaf3512e4a5dd9762372afb879a458/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropNotNull({
        schema: 'public',
        table: 'user',
        column: 'organizationId',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
