require('dotenv/config');

const { db } = require('../dist/prisma/db.js');

async function resetDatabase() {
  const plan = db.raw.sql`TRUNCATE TABLE "user", "organization" CASCADE`
    .affectedCount()
    .build();
  const result = await db.runtime().execute(plan);
  const [userCount, organizationCount] = await Promise.all([
    db.orm.public.User.aggregate((aggregate) => ({ total: aggregate.count() })),
    db.orm.public.Organization.aggregate((aggregate) => ({ total: aggregate.count() })),
  ]);
  console.log(
    `Database reset complete. Users: ${userCount.total}; Organizations: ${organizationCount.total}; Truncate result: ${result.affectedRows}`,
  );
}

resetDatabase()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
