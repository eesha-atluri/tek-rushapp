import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const temporaryPassword = process.env.TEMP_PASSWORD;

if (!temporaryPassword) {
  console.error("Missing TEMP_PASSWORD in .env.local");
  process.exit(1);
}

const users = [
  ["Eesha Atluri", "eatluri@umich.edu"],
  ["River Miyun McCorry", "rivermcc@umich.edu"],
  ["Joshua Young", "joshyy@umich.edu"],
  ["Nathan Robert Lesny", "nlesny@umich.edu"],
  ["Arnav Darshan Kadam", "arnavdk@umich.edu"],
  ["Maddie Gold", "mbgold@umich.edu"],
  ["Preston Gray Woodworth", "prestw@umich.edu"],
  ["Megan Gottfried", "megangot@umich.edu"],
  ["Ayaan Vaswani", "ayaanv@umich.edu"],
  ["Daniel Wang", "dxnny@umich.edu"],
  ["Olivia Delphine Bonnewit", "obonn@umich.edu"],
  ["Benjamin Alexander Stevenson", "benstev@umich.edu"],
  ["Nandita Shenoy", "nshenoy@umich.edu"],
  ["Nathan Michael Bishop", "nbish@umich.edu"],
  ["Gracie Hou", "ghou@umich.edu"],
  ["Sam Koda", "samkoda@umich.edu"],
  ["Winston Wu", "winwu@umich.edu"],
  ["Manushri Anand", "manushri@umich.edu"],
  ["Alisha Vasan", "alishakv@umich.edu"],
  ["Pranav Goyal", "goyalp@umich.edu"],
  ["Suprita Nagali", "supritan@umich.edu"],
  ["Manuel Antonio Rosso-Benitez", "marosso@umich.edu"],
  ["Madeline Ellies", "mellies@umich.edu"],
  ["Michael M Feneberg", "mfeneber@umich.edu"],
  ["Avram Joshua Tarun", "ajltarun@umich.edu"],
  ["Stella Grace Johnson", "stellajo@umich.edu"],
  ["Samuel Joseph Wit", "samwit@umich.edu"],
  ["David Matthew Sanico", "dsanico@umich.edu"],
  ["Lucas Crespo", "crespo@umich.edu"],
  ["Aditi Vishnubhatla", "aditiv@umich.edu"],
  ["Anjali Brahmasandra", "banjali@umich.edu"],
  ["Rhea Chokhalingam", "rchokha@umich.edu"],
  ["Alexandru Dumitrascu", "agdumi@umich.edu"],
  ["Aiden David Hegenauer", "aheggie@umich.edu"],
  ["Bowie Cooper", "bowiec@umich.edu"],
  ["Katie Jayong Lee", "leekatie@umich.edu"],
  ["Alexandra Doytcheva", "adoytch@umich.edu"],
  ["Aaron Sun", "asunaron@umich.edu"],
  ["Evan Short", "shorevan@umich.edu"],
  ["Aria Fifer", "ariaf@umich.edu"],
  ["Ahmed Said Hadi", "ahmedhad@umich.edu"],
  ["Laya Mantha", "layam@umich.edu"],
  ["Ana Ryerson", "anaryer@umich.edu"],
  ["Nandini Desaraju", "nandinix@umich.edu"],
  ["Jacob Michael Levin", "jaklevin@umich.edu"],
  ["Yana Alok Mehta", "yamehta@umich.edu"],
  ["Casey Phoenix Zhang", "caseyz@umich.edu"],
  ["Nano Nikuradze", "nanon@umich.edu"],
  ["Zachary Freed", "zfreed@umich.edu"],
  ["Vaelone Elankumaran", "vaelone@umich.edu"],
  ["Nina Gernhardt", "ninagern@umich.edu"],
  ["Ellen Patricia Grehan", "elgrehan@umich.edu"],
  ["Sahithi Nalamothu", "sahithin@umich.edu"],
  ["Quincy Loegering", "quincylo@umich.edu"],
  ["Tai Demura-Devore", "taidd@umich.edu"],
  ["Liad Ariel Gross", "liadgr@umich.edu"],
  ["Insu Jung", "insujung@umich.edu"],
  ["Sungat Shienh", "sungat@umich.edu"],
  ["Allison Sarah Yang", "allyang@umich.edu"],
  ["Steven Li", "listeve@umich.edu"],
  ["Pablo Segovia", "psegovia@umich.edu"],
  ["Devan Pradhan", "devprad@umich.edu"],
  ["Justin Hirsch", "jdhirsch@umich.edu"],
  ["Molly Bryn Rich", "mollyri@umich.edu"],
  ["Sana Gupta", "sanag@umich.edu"],
  ["Drew Dame", "drewdame@umich.edu"],
  ["Veronica Tananko", "ntananko@umich.edu"],
  ["Ashish Rajam", "ashishmr@umich.edu"],
  ["Anuj Kumar Arora", "aanuj@umich.edu"],
  ["Rianna Nikhade", "riannan@umich.edu"],
  ["Lukas Mateju", "lmateju@umich.edu"],
  ["Margaret Periard", "perimar@umich.edu"],
  ["Thewfic Anwar", "thewfic@umich.edu"],
  ["Brady Adams", "bradyads@umich.edu"],
  ["Yoav Manor", "ymanor@umich.edu"],
  ["Lucia Grasso", "luciagra@umich.edu"],
  ["Brie Everson", "brieeve@umich.edu"],
  ["Garrett Cheng", "gdcheng@umich.edu"],
  ["Grant Patterson", "grantpa@umich.edu"],
  ["Jay Sarkar", "jaysark@umich.edu"],
  ["Sanika Vemali", "svemali@umich.edu"],
  ["Zaara Seemeen", "zseemeen@umich.edu"],
  ["Ellie Gruber", "eegruber@umich.edu"],
  ["Owen Bogda", "obogda@umich.edu"],
  ["Avary Sheldon", "avaryksheldon@gmail.com"],
  ["Alex Habarth", "alexhab@umich.edu"],
  ["Sean Kang", "seanyk@umich.edu"],
  ["Sahasra Potla", "sahasra@umich.edu"],
];

for (const [name, email] of users) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      name,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      console.log(`Already exists: ${email}`);
      continue;
    }

    console.error(`Failed: ${email}`, error.message);
    continue;
  }

  console.log(`Created: ${email} (${data.user?.id})`);
}

console.log("Done.");