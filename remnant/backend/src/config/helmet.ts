import helmet from 'helmet'

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: [
        '\'self\'',
        'https://cdn.jsdelivr.net',
        '\'unsafe-inline\'',
      ],
      styleSrc: [
        '\'self\'',
        'https://cdn.jsdelivr.net',
        '\'unsafe-inline\'',
      ],
      fontSrc: [
        '\'self\'',
        'https://fonts.gstatic.com',
      ],
      imgSrc: [
        '\'self\'',
        'data:',
      ],
      connectSrc: [
        '\'self\'',
        'https://cdn.jsdelivr.net',
      ],
      objectSrc: ['\'none\''],
      upgradeInsecureRequests: [],
    },
  },
})
