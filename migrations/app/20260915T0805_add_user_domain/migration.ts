#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/03bd572ae289f172a6a2728601a7f24d462e09df21d903621fed467390ccd574/contract';
import endContract from '../../snapshots/03bd572ae289f172a6a2728601a7f24d462e09df21d903621fed467390ccd574/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
