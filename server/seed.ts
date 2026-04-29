import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import User from './src/models/User';
import Transaction from './src/models/Transaction';

dotenv.config();

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI as string,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME as string,
    process.env.NEO4J_PASSWORD as string
  )
);

const sampleUsers = [
  { username: 'sarah.johnson', full_name: 'Sarah Johnson', gender: 'female', pan_card: 'ABCDE1234F', balance: 75000 },
  { username: 'michael.chen', full_name: 'Michael Chen', gender: 'male', pan_card: 'FGHIJ5678K', balance: 120000 },
  { username: 'priya.sharma', full_name: 'Priya Sharma', gender: 'female', pan_card: 'KLMNO9012P', balance: 45000 },
  { username: 'david.wilson', full_name: 'David Wilson', gender: 'male', pan_card: 'PQRST3456Q', balance: 200000 },
  { username: 'emma.davis', full_name: 'Emma Davis', gender: 'female', pan_card: 'UVWXY7890R', balance: 35000 },
  { username: 'raj.patel', full_name: 'Raj Patel', gender: 'male', pan_card: 'ZABCD1111S', balance: 95000 },
  { username: 'lisa.anderson', full_name: 'Lisa Anderson', gender: 'female', pan_card: 'EFGHI2222T', balance: 60000 },
  { username: 'alex.kumar', full_name: 'Alex Kumar', gender: 'male', pan_card: 'JKLMN3333U', balance: 85000 },
  { username: 'nina.reddy', full_name: 'Nina Reddy', gender: 'female', pan_card: 'MNOPQ4444V', balance: 42000 },
  { username: 'james.smith', full_name: 'James Smith', gender: 'male', pan_card: 'RSTUV5555W', balance: 155000 },
  { username: 'kavita.iyer', full_name: 'Kavita Iyer', gender: 'female', pan_card: 'XYZAB6666X', balance: 68000 },
  { username: 'tom.harris', full_name: 'Tom Harris', gender: 'male', pan_card: 'CDEFG7777Y', balance: 92000 },
  { username: 'sneha.menon', full_name: 'Sneha Menon', gender: 'female', pan_card: 'HIJKL8888Z', balance: 55000 },
  { username: 'ryan.scott', full_name: 'Ryan Scott', gender: 'male', pan_card: 'MNOPQ9999A', balance: 135000 },
  { username: 'deepa.nair', full_name: 'Deepa Nair', gender: 'female', pan_card: 'RSTUV0000B', balance: 48000 },
  { username: 'mark.taylor', full_name: 'Mark Taylor', gender: 'male', pan_card: 'WXYZA1111C', balance: 178000 },
  { username: 'anita.rao', full_name: 'Anita Rao', gender: 'female', pan_card: 'BCDEF2222D', balance: 72000 },
  { username: 'chris.moore', full_name: 'Chris Moore', gender: 'male', pan_card: 'GHIJK3333E', balance: 112000 },
  { username: 'meera.kulkarni', full_name: 'Meera Kulkarni', gender: 'female', pan_card: 'LMNOP4444F', balance: 39000 },
  { username: 'kevin.brown', full_name: 'Kevin Brown', gender: 'male', pan_card: 'QRSTU5555G', balance: 165000 },
  { username: 'geeta.verma', full_name: 'Geeta Verma', gender: 'female', pan_card: 'VWXYZ6666H', balance: 51000 },
  { username: 'paul.jackson', full_name: 'Paul Jackson', gender: 'male', pan_card: 'ABCDE7777I', balance: 198000 },
  { username: 'divya.singh', full_name: 'Divya Singh', gender: 'female', pan_card: 'FGHIJ8888J', balance: 63000 },
  { username: 'stuart.white', full_name: 'Stuart White', gender: 'male', pan_card: 'KLMNO9999K', balance: 145000 },
  { username: 'poonam.aggarwal', full_name: 'Poonam Aggarwal', gender: 'female', pan_card: 'PQRST0000L', balance: 47000 },
  { username: 'gary.martin', full_name: 'Gary Martin', gender: 'male', pan_card: 'UVWXY1111M', balance: 128000 },
  { username: 'ritu.gupta', full_name: 'Ritu Gupta', gender: 'female', pan_card: 'ZABCD2222N', balance: 59000 },
];

const mpin = '123456';

const descriptions = [
  'Payment for services', 'Invoice settlement', 'Monthly rent transfer',
  'Friend reimbursement', 'Business payment', 'Grocery shopping',
  'Utility bill payment', 'Online purchase', 'Gift transfer', 'Salary advance',
  'Insurance premium', 'Loan repayment', 'Investment transfer', 'Shopping refund',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysBack: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
}

async function seedNeo4jUser(user: typeof sampleUsers[0]) {
  const session = neo4jDriver.session({ database: 'neo4j' });
  try {
    await session.run(
      `MERGE (u:User {username: $username})
       ON CREATE SET u.full_name = $full_name, u.gender = $gender, u.pan_card = $pan_card, u.balance = $balance, u.createdAt = timestamp(), u.latest_login = null
       RETURN u`,
      { username: user.username, full_name: user.full_name, gender: user.gender, pan_card: user.pan_card, balance: user.balance }
    );
  } finally {
    await session.close();
  }
}

async function seedTransactionToNeo4j(tx: { senderUsername: string; receiverUsername: string; amount: number; description: string; status: string; is_fraud: boolean; transaction_distance?: number }) {
  const session = neo4jDriver.session({ database: 'neo4j' });
  try {
    await session.run(
      `MATCH (sender:User {username: $senderUsername}), (receiver:User {username: $receiverUsername})
       CREATE (sender)-[t:SENT_TO {amount: $amount, description: $description, status: $status, createdAt: timestamp(), is_fraud: $is_fraud, transaction_distance: $transaction_distance}]->(receiver)
       RETURN t`,
      { ...tx, transaction_distance: tx.transaction_distance ?? 0 }
    );
  } finally {
    await session.close();
  }
}

async function seedDatabase() {
  try {
    console.log('[MongoDB] Connecting...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('[MongoDB] Connected successfully');

    const hashedMpin = await bcrypt.hash(mpin, 10);
    const userMap: Map<string, mongoose.Types.ObjectId> = new Map();

    for (const userData of sampleUsers) {
      let user = await User.findOne({ username: userData.username });
      if (!user) {
        user = new User({ ...userData, mpin: hashedMpin, role: 'user' });
        await user.save();
        console.log(`[MongoDB] Seeded user: ${userData.username}`);
      }
      userMap.set(userData.username, user._id as mongoose.Types.ObjectId);
      await seedNeo4jUser(userData);
    }

    console.log('\n[Seeding Transactions...]');
    let totalTx = 0;

    for (const sender of sampleUsers) {
      const receivers = sampleUsers.filter(u => u.username !== sender.username);
      const txCount = randomInt(20, 22);
      const senderId = userMap.get(sender.username)!;

      for (let i = 0; i < txCount; i++) {
        const receiver = randomElement(receivers);
        const amount = randomInt(500, 15000);
        const isWeekend = [0, 6].includes(getRandomDate(1).getDay());
        const hour = randomInt(0, 23);
        const isNight = hour >= 22 || hour < 6;
        const isFraud = Math.random() < 0.05;
        const status = isFraud ? 'FRAUD' : (Math.random() < 0.1 ? 'FAILED' : 'SUCCESS');

        const receiverId = userMap.get(receiver.username)!;

        const mongoTx = new Transaction({
          user: senderId,
          counterparty: receiverId,
          transaction_amount: amount,
          transaction_type: 'DEBIT',
          description: randomElement(descriptions),
          status,
          account_balance: sender.balance - amount,
          ip_address: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
          ip_address_flag: false,
          previous_fraudulent_activity: isFraud ? randomInt(1, 3) : 0,
          daily_transaction_count: randomInt(1, 10),
          avg_transaction_amount_7d: randomInt(1000, 5000),
          failed_transaction_count_7d: randomInt(0, 3),
          account_age: randomInt(180, 2000),
          timestamp: getRandomDate(30),
          transaction_hour: hour,
          is_weekend: isWeekend,
          is_night: isNight,
          time_since_last_transaction: randomInt(60, 86400),
          transaction_to_balance_ratio: parseFloat((amount / sender.balance).toFixed(4)),
          sender_lat: randomInt(19, 29) + Math.random(),
          sender_long: randomInt(72, 88) + Math.random(),
          beneficiary_lat: randomInt(19, 29) + Math.random(),
          beneficiary_long: randomInt(72, 88) + Math.random(),
          transaction_distance: randomInt(0, 1500),
          distance_avg_transaction_7d: randomInt(50, 500),
          is_fraud: isFraud,
        });

        await mongoTx.save();
        totalTx++;

        await seedTransactionToNeo4j({
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          amount,
          description: mongoTx.description!,
          status,
          is_fraud: isFraud,
          transaction_distance: mongoTx.transaction_distance ?? 0,
        });
      }

      const creditTx = new Transaction({
        user: senderId,
        counterparty: userMap.get(randomElement(receivers).username)!,
        transaction_amount: randomInt(1000, 8000),
        transaction_type: 'CREDIT',
        description: 'Received payment',
        status: 'SUCCESS',
        account_balance: sender.balance + randomInt(1000, 8000),
        timestamp: getRandomDate(15),
        transaction_hour: randomInt(9, 18),
        is_weekend: false,
        is_night: false,
      });
      await creditTx.save();
      totalTx++;
    }

    console.log(`[Transactions] Seeded ${totalTx} transactions`);
    console.log('\n[Seeding Complete]');
    console.log(`Total users: ${sampleUsers.length}`);
    console.log(`Total transactions: ${totalTx}`);
    console.log(`Default MPIN: ${mpin}`);

  } catch (error) {
    console.error('[Error] Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await neo4jDriver.close();
    console.log('[Database] Connections closed');
  }
}

seedDatabase();
