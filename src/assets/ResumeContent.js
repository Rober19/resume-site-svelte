import { writable } from 'svelte/store';

let spanish = {
  main: {
    name: 'Roberto Batty',
    work_at: 'Overseas Solutions',
    occupation: 'Desarrollador de Software',
    word_at: '  para  ',
    // description:
    //   'Here will be your description. Use this to describe what you do or whatever you feel best describes yourself to a potential employer',
    image: 'profilepic.jpg',
    // bio:
    //   'Use this bio section as your way of describing yourself and saying what you do, what technologies you like to use or feel most comfortable with, describing your personality, or whatever else you feel like throwing in.',
    // contactmessage:
    //   'Here is where you should write your message to readers to have them get in contact with you.',
    email: 'roberbatty@gmail.com',
    phone: '##',
    address: {
      street: '',
      city: 'Cartagena',
      state: 'Bolivar',
      country: 'Colombia',
      zip: '130014',
    },
    website: '##',
    resumedownload: null,
    social: [
      // {
      //   name: 'facebook',
      //   url: 'https://www.facebook.com/iaMuhammedErdem',
      //   className: 'profile-card-social__item facebook',
      //   icon: '#icon-facebook',
      // },
      {
        name: 'twitter',
        url: 'http://twitter.com/_rober19',
        className: 'profile-card-social__item link',
        icon: '#icon-twitter',
      },
      // {
      //   name: 'behance',
      //   url: 'http://googleplus.com/tbakerx',
      //   className: 'profile-card-social__item behance',
      //   icon: '#icon-behance',
      // },
      {
        name: 'linkedin',
        url: 'https://www.linkedin.com/in/robertobatty/',
        className: 'profile-card-social__item facebook',
        icon: '#linkedin',
      },
      // {
      //   name: 'instagram',
      //   url: 'http://instagram.com/tbaker_x',
      //   className: 'profile-card-social__item instagram',
      //   icon: '#icon-instagram',
      // },
      {
        name: 'github',
        url: 'http://github.com/rober19',
        className: 'profile-card-social__item instagram',
        icon: '#icon-github',
      },
      // {
      //   name: 'codepen',
      //   url: 'http://skype.com',
      //   className: 'profile-card-social__item codepen',
      //   icon: '#icon-codepen',
      // },
      // {
      //   name: 'link',
      //   url: 'http://skype.com',
      //   className: 'profile-card-social__item link',
      //   icon: '#icon-link',
      // },
    ],
  },
  resume: {
    show_skills: true,
    show_skills_tags: true,
    show_education: true,
    show_work: true,
    skillmessage: 'Estimando las habilidades primordiales',
    skills_title: 'Destrezas',
    education_title: 'Educación',
    work_title: 'Experiencia',
    education: [
      {
        school: 'Tecnologíco Comfenalco',
        degree: 'Ingeniería de Sistemas',
        graduated: '2020 - 2021 (Pendiente)',
        description: '... ',
      },
      {
        school: 'Tecnologíco Comfenalco',
        degree: 'Tecnología en Desarrollo de Software',
        graduated: '2017 - 2019 (Cursando)',
        description: '... ',
      },
      {
        school: 'Colegío Mixto La Popa',
        degree: 'Bachiller',
        graduated: 'November 2016',
        description:
          // 'Describe your experience at school, what you learned, what useful skills you have acquired etc.',
          '...',
      },
    ],
    work: [
      {
        company: 'Overseas Solutions',
        title: 'Desarrollador de Software',
        years: '2018 - Present',
        description:
          // 'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
          'Proyectos de fuerte arquitectura, usando Java, PHP, JavaScript (NodeJS, Vue, Angular), apollados sobre bases SQL, NoSQL y plataformas como Heroku, Google Cloud, Firebase',
      },
      // {
      //   company: 'Super Cool Studio',
      //   title: 'Junior bug fixer',
      //   years: 'March 2007 - February 2010',
      //   description:
      //     'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
      // },
    ],
    skills: [
      {
        name: 'Git',
        level: '55%',
      },
      {
        name: 'Node.js',
        level: '70%',
      },
      {
        name: 'Typescript',
        level: '60%',
      },
      {
        name: 'Java',
        level: '60%',
      },
      {
        name: 'HTML5',
        level: '50%',
      },
      {
        name: 'Js',
        level: '60%',
      },
      {
        name: 'CSS',
        level: '45%',
      },
      {
        name: 'MongoDB',
        level: '50%',
      },
      {
        name: 'SQL',
        level: '50%',
      },
    ],
    skills_tags_titles: {
      title_1: 'Herramientas que he usado en mi vida',
      lvl_1: 'Avanzado',
      lvl_2: 'Intermedio',
      lvl_3: 'Afición',
    },
    skills_tags: {
      advanced: [
        {
          name: 'Node.js',
        },
      ],
      intermediate: [
        {
          name: 'TypeScript',
        },
        {
          name: 'Angular (and AngularJS)',
        },
        {
          name: 'React',
        },
        {
          name: 'Vue',
        },
        {
          name: 'PHP',
        },
        {
          name: 'Cpanel',
        },
        {
          name: 'Firebase (firestore)',
        },
        {
          name: 'Google Cloud (datastore)',
        },
        {
          name: 'SQL',
        },
        {
          name: 'DevOps',
        },
        {
          name: 'C#',
        },
        {
          name: 'Heroku',
        },
        {
          name: 'Java',
        },
      ],
      hobby: [
        {
          name: 'Shell',
        },
        {
          name: 'MS-DOS',
        },
        {
          name: 'Powershell',
        },
        {
          name: 'Travis CI',
        },
        {
          name: 'npm (own package)',
        },
        {
          name: 'Azure',
        },
        {
          name: 'DevOps',
        },
        {
          name: 'Visual Basic',
        },
        {
          name: 'Pixel Art',
        },
        {
          name: 'Game Maker',
        },
        {
          name: 'Adobe Premiere',
        },
        {
          name: 'Adobe Photoshop',
        },
        {
          name: 'Adobe Illustrator',
        },
        {
          name: 'Ionic',
        },
        {
          name: 'Vsce Market (own snippets)',
        },
        {
          name: 'Go',
        },
        {
          name: 'Svelte',
        },
        {
          name: 'Markdown',
        },
      ],
    },
  },
  portfolio: {
    projects: [
      {
        title: 'Canadian Wanderlust',
        category: 'My Travel Blog for my post-university travels',
        image: 'canadian-wanderlust.jpg',
        url: 'https://www.canadianwanderlust.com',
      },
      {
        title: 'Fury Fighting Gear',
        category: '(offline now) A fighting gear company I started',
        image: 'fury-fighting-gear.jpg',
        url: 'http://www.timbakerdev.com',
      },
      {
        title: 'Original Thai Food',
        category: 'Website I built for a restaurant I like in Thailand',
        image: 'original-thai-food.jpg',
        url: 'http://www.timbakerdev.com/originalthaifood.github.io',
      },
      {
        title: 'Resume Website',
        category: 'A React based resume website template',
        image: 'resume-website.jpg',
        url: 'http://www.timbakerdev.com',
      },
      {
        title: 'Smirkspace',
        category: '(MVP Only) A React and Meteor based chat University project.',
        image: 'smirkspace.jpg',
        url: 'http://www.smirkspace.com',
      },
    ],
  },
};

let english = {
  main: {
    name: 'Roberto Batty',
    work_at: 'Overseas Solutions',
    occupation: 'Software Developer',
    word_at: ' at ',
    image: 'profilepic.jpg',
    email: 'roberbatty@gmail.com',
    phone: '##',
    address: {
      street: '',
      city: 'Cartagena',
      state: 'Bolivar',
      country: 'Colombia',
      zip: '130014',
    },
    website: '##',
    resumedownload: null,
    social: [
      // {
      //   name: 'facebook',
      //   url: 'https://www.facebook.com/iaMuhammedErdem',
      //   className: 'profile-card-social__item facebook',
      //   icon: '#icon-facebook',
      // },
      {
        name: 'twitter',
        url: 'http://twitter.com/_rober19',
        className: 'profile-card-social__item link',
        icon: '#icon-twitter',
      },
      // {
      //   name: 'behance',
      //   url: 'http://googleplus.com/tbakerx',
      //   className: 'profile-card-social__item behance',
      //   icon: '#icon-behance',
      // },
      {
        name: 'linkedin',
        url: 'https://www.linkedin.com/in/robertobatty/',
        className: 'profile-card-social__item facebook',
        icon: '#linkedin',
      },
      // {
      //   name: 'instagram',
      //   url: 'http://instagram.com/tbaker_x',
      //   className: 'profile-card-social__item instagram',
      //   icon: '#icon-instagram',
      // },
      {
        name: 'github',
        url: 'http://github.com/rober19',
        className: 'profile-card-social__item instagram',
        icon: '#icon-github',
      },
      // {
      //   name: 'codepen',
      //   url: 'http://skype.com',
      //   className: 'profile-card-social__item codepen',
      //   icon: '#icon-codepen',
      // },
      // {
      //   name: 'link',
      //   url: 'http://skype.com',
      //   className: 'profile-card-social__item link',
      //   icon: '#icon-link',
      // },
    ],
  },
  resume: {
    show_skills: true,
    show_skills_tags: true,
    show_education: true,
    show_work: true,
    skillmessage: '...',
    skills_title: 'Skills',
    education_title: 'Education',
    work_title: 'Work',
    education: [
      {
        school: 'Tecnologíco Comfenalco',
        degree: 'Systems Engineering Degree',
        graduated: '2020 - 2021 (Pending)',
        description: '... ',
      },
      {
        school: 'Tecnologíco Comfenalco',
        degree: 'Software Development Technology',
        graduated: '2017 - 2019 (Present)',
        description: '... ',
      },
      {
        school: 'Colegío Mixto La Popa',
        degree: 'Bachelor Degree',
        graduated: 'November 2016',
        description:
          // 'Describe your experience at school, what you learned, what useful skills you have acquired etc.',
          '...',
      },
    ],
    work: [
      {
        company: 'Overseas Solutions',
        title: 'Software Developer',
        years: '2018 - Present',
        description:
          // 'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
          '...',
      },
      // {
      //   company: 'Super Cool Studio',
      //   title: 'Junior bug fixer',
      //   years: 'March 2007 - February 2010',
      //   description:
      //     'Describe work, special projects, notable achievements, what technologies you have been working with, and anything else that would be useful for an employer to know.',
      // },
    ],
    skills: [
      {
        name: 'Git',
        level: '55%',
      },
      {
        name: 'Node.js',
        level: '70%',
      },
      {
        name: 'Typescript',
        level: '60%',
      },
      {
        name: 'Java',
        level: '60%',
      },
      {
        name: 'HTML5',
        level: '50%',
      },
      {
        name: 'Js',
        level: '60%',
      },
      {
        name: 'CSS',
        level: '45%',
      },
      {
        name: 'MongoDB',
        level: '50%',
      },
      {
        name: 'SQL',
        level: '50%',
      },
    ],
    skills_tags_titles: {
      title_1: 'Tools that I have used in my life',
      lvl_1: 'Advanced',
      lvl_2: 'Intermediate',
      lvl_3: 'Hobby',
    },
    skills_tags: {
      advanced: [
        {
          name: 'Node.js',
        },
      ],
      intermediate: [
        {
          name: 'TypeScript',
        },
        {
          name: 'Angular (and AngularJS)',
        },
        {
          name: 'React',
        },
        {
          name: 'Vue',
        },
        {
          name: 'PHP',
        },
        {
          name: 'Cpanel',
        },
        {
          name: 'Firebase (firestore)',
        },
        {
          name: 'Google Cloud (datastore)',
        },
        {
          name: 'SQL',
        },
        {
          name: 'DevOps',
        },
        {
          name: 'C#',
        },
        {
          name: 'Heroku',
        },
        {
          name: 'Java',
        },
      ],
      hobby: [
        {
          name: 'Shell',
        },
        {
          name: 'MS-DOS',
        },
        {
          name: 'Powershell',
        },
        {
          name: 'Travis CI',
        },
        {
          name: 'npm (own package)',
        },
        {
          name: 'Azure',
        },
        {
          name: 'DevOps',
        },
        {
          name: 'Visual Basic',
        },
        {
          name: 'Pixel Art',
        },
        {
          name: 'Game Maker',
        },
        {
          name: 'Adobe Premiere',
        },
        {
          name: 'Adobe Photoshop',
        },
        {
          name: 'Adobe Illustrator',
        },
        {
          name: 'Ionic',
        },
        {
          name: 'Vsce Market (own snippets)',
        },
        {
          name: 'Go',
        },
        {
          name: 'Svelte',
        },
        {
          name: 'Markdown',
        },
      ],
    },
  },
  portfolio: {
    projects: [
      {
        title: 'Canadian Wanderlust',
        category: 'My Travel Blog for my post-university travels',
        image: 'canadian-wanderlust.jpg',
        url: 'https://www.canadianwanderlust.com',
      },
      {
        title: 'Fury Fighting Gear',
        category: '(offline now) A fighting gear company I started',
        image: 'fury-fighting-gear.jpg',
        url: 'http://www.timbakerdev.com',
      },
      {
        title: 'Original Thai Food',
        category: 'Website I built for a restaurant I like in Thailand',
        image: 'original-thai-food.jpg',
        url: 'http://www.timbakerdev.com/originalthaifood.github.io',
      },
      {
        title: 'Resume Website',
        category: 'A React based resume website template',
        image: 'resume-website.jpg',
        url: 'http://www.timbakerdev.com',
      },
      {
        title: 'Smirkspace',
        category: '(MVP Only) A React and Meteor based chat University project.',
        image: 'smirkspace.jpg',
        url: 'http://www.smirkspace.com',
      },
    ],
  },
};

export const content_app = spanish;

function createCount() {
  const { subscribe, set, update } = writable(spanish);

  return {
    subscribe,
    useEng: () => update(data => english),
    useEsp: () => update(data => spanish),
    reset: () => {},
  };
}

export const db_content = createCount();
