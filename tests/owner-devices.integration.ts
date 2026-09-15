import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db';
import { registerOwnerDevice } from '@/services/analytics/register-owner-device';
import { getSessionIntelligence } from '@/services/analytics/session-intelligence';
import { defaultDeviceName, validVisitorKey } from '@/lib/analytics/owner-device';

const keys=[randomUUID(),randomUUID(),randomUUID()];
let userId: string | undefined;
try {
  assert.equal(defaultDeviceName('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit Safari/605.1 Mobile'), 'iPhone · Safari');
  assert.equal(defaultDeviceName('Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/130.0'), 'Mac · Chrome');
  assert.equal(validVisitorKey('made-up-owner'), null);
  const user=await prisma.user.create({data:{email:`device-qa-${randomUUID()}@example.invalid`,passwordHash:'non-login-test-fixture'}}); userId=user.id;
  for(const key of keys) await prisma.pageVisit.create({data:{path:'/',visitorKey:key,sessionKey:randomUUID()}});
  await prisma.$transaction(tx=>registerOwnerDevice(tx,user.id,keys[0],'Macintosh Chrome/130.0'));
  const device=await prisma.ownerDevice.findUniqueOrThrow({where:{visitorKey:keys[0]}});
  await prisma.ownerDevice.update({where:{id:device.id},data:{name:'QA Mac one'}});
  await prisma.$transaction(tx=>registerOwnerDevice(tx,user.id,keys[0],'Macintosh Chrome/130.0'));
  await prisma.$transaction(tx=>registerOwnerDevice(tx,user.id,keys[1],'iPhone Mobile Safari/605.1'));
  assert.equal(await prisma.ownerDevice.count({where:{userId:user.id}}),2);
  assert.equal(await prisma.ownerLogin.count({where:{device:{userId:user.id}}}),3);
  assert.equal((await prisma.ownerDevice.findUniqueOrThrow({where:{id:device.id}})).name,'QA Mac one');
  const own=await getSessionIntelligence({filters:{ownership:'own'}});
  assert.ok(own.sessions.some(s=>s.ownerDeviceName==='QA Mac one'));
  const external=await getSessionIntelligence();
  assert.ok(external.sessions.every(s=>s.ownerDeviceName===null));
  const all=await getSessionIntelligence({filters:{ownership:'all'}});
  assert.equal(all.metrics.sessions,own.metrics.sessions+external.metrics.sessions);
  assert.equal(all.metrics.pageViews,own.metrics.pageViews+external.metrics.pageViews);
  assert.equal(await prisma.ownerDevice.updateMany({where:{id:device.id,userId:'another-account'},data:{name:'forbidden'}}).then(r=>r.count),0);
  console.log('PASS: recognition, two devices, repeated sign-in audit, rename preservation, earlier visit labeling, default exclusion, metric consistency and account-scoped rename.');
} finally {
  await prisma.pageVisit.deleteMany({where:{visitorKey:{in:keys}}});
  if(userId) await prisma.user.delete({where:{id:userId}});
  await prisma.$disconnect();
}
