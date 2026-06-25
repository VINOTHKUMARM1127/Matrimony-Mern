const fs = require('fs');
const path = require('path');

const MALE_NAMES = [
  'Karthik', 'Suresh', 'Vignesh', 'Aravind', 'Ramesh', 'Prakash', 'Bala', 'Anbarasan', 'Murugan', 'Muthu',
  'Senthil', 'Saravanan', 'Dinesh', 'Vinoth', 'Prabhu', 'Rajesh', 'Selvam', 'Manikandan', 'Vijay', 'Ajith',
  'Surya', 'Siva', 'Ganesan', 'Hari', 'Shankar', 'Vetrivel', 'Kabilan', 'Elango', 'Arun', 'Ranjith'
];

const FEMALE_NAMES = [
  'Anitha', 'Divya', 'Priya', 'Kavitha', 'Soundarya', 'Janani', 'Sneha', 'Keerthana', 'Megala', 'Nandhini',
  'Ramya', 'Preethi', 'Sowmya', 'Swetha', 'Meenakshi', 'Abirami', 'Gayathri', 'Shalini', 'Archana', 'Sandhya',
  'Malarvizhi', 'Kayalvizhi', 'Ponmani', 'Yazhini', 'Oviya', 'Dharshini', 'Harini', 'Nivedha', 'Pavithra', 'Pooja'
];

const SURNAMES = ['Kumar', 'Raj', 'Sundaram', 'Selvan', 'Lingam', 'Nathan', 'Pandian', 'Devan', 'Velan', 'Murthy'];

const CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'];

const CASTES = {
  Hindu: ['Vanniyar', 'Vellalar', 'Mudaliar', 'Chettiar', 'Naidu', 'Brahmin - Iyer', 'Pillai', 'Yadav', 'Naicker', 'Thevar'],
  Christian: ['RC Christian', 'Protestant Christian', 'Pentecostal', 'CSI Christian'],
  Muslim: ['Sunni Muslim', 'Shia Muslim', 'Rawther', 'Marakayar']
};

const OCCUPATIONS = [
  'Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Doctor', 'Dentist', 'School Teacher',
  'Business Owner', 'Bank Manager', 'Government Officer', 'HR Specialist', 'Architect'
];

const EDUCATION_LEVELS = ['B.E. / B.Tech', 'M.B.B.S', 'M.B.A', 'M.C.A', 'B.Sc', 'M.Sc', 'B.Com'];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateUsers = (count) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const gender = i % 2 === 0 ? 'female' : 'male';
    const firstName = gender === 'male' ? pickRandom(MALE_NAMES) : pickRandom(FEMALE_NAMES);
    const lastName = pickRandom(SURNAMES);
    
    const age = randomRange(21, 35);
    const birthYear = new Date().getFullYear() - age;
    const dob = `${birthYear}-${String(randomRange(1, 12)).padStart(2, '0')}-${String(randomRange(1, 28)).padStart(2, '0')}`;
    
    const religionRand = Math.random();
    const religion = religionRand < 0.85 ? 'Hindu' : religionRand < 0.93 ? 'Christian' : 'Muslim';
    
    // Generate a random 10 digit phone number starting with 9, 8, or 7
    const phone = `${pickRandom([9,8,7])}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;

    users.push({
      email: `testuser${i}@matrimonydemo.com`,
      password: "SecurePassword123!",
      display_name: `${firstName} ${lastName}`,
      gender: gender,
      date_of_birth: dob,
      phone: phone,
      religion: religion,
      caste: pickRandom(CASTES[religion]),
      city: pickRandom(CITIES),
      education: pickRandom(EDUCATION_LEVELS),
      occupation: pickRandom(OCCUPATIONS)
    });
  }
  return users;
};

const users = generateUsers(500);
fs.writeFileSync(path.join(__dirname, '500_users.json'), JSON.stringify(users, null, 2), 'utf8');
console.log('Successfully generated 500_users.json with 500 records.');
