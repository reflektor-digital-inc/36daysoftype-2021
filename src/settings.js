import { capitalCase } from 'change-case';
import packageJSON from '../package.json';

export const IS_DEV = process.env.NODE_ENV === 'development';

export const PROJECT_NAME = capitalCase(packageJSON.name);

export const DEVICE_VIEWPORTS = {
  desktop : {
    width : {
      min : 1025,
      max : null
    }
  },
  'desktop-narrow' : {
    width : {
      min : 1025,
      max : 1399
    }
  },
  'desktop-common' : {
    width : {
      min : 1366,
      max : 1439
    }
  },
  tablet : {
    width : {
      min : 728,
      max : 1024
    }
  },
  phone : {
    width : {
      min : 300,
      max : 727
    }
  }
};

export const CONTENTFUL_CONFIG = {
  spaceID : '',
  accessToken : '',
  locales : {
    en : 'en-CA',
    fr : 'fr-CA'
  },
  pages : {
    // Example Config
    ageGate : {
      contentTypeID : 'ageGate',
      contentEntryID : 'JEgJBU3auysDIPQP9zUiH'
    },
    home : {
      contentTypeID : 'homepage',
      contentEntryID : '5J41p9hLapD8Y4yZY7Kn04'
    },
    contact : {
      contentTypeID : 'contactPage',
      contentEntryID : '46g1xIxA7B5cMjS76xggIO'
    },
    products : {
      contentTypeID : 'productPage',
      contentEntryID : '90SwPjdgW3VL7Fzd8YZ9F'
    },
    notFound404 : {
      contentTypeID : 'errorPage',
      contentEntryID : 'jPgt7Pd3CAoGsZsXuwxgJ'
    },
    labels : {
      contentTypeID : 'generalLabels',
      contentEntryID : '1HXj9P4SmYj4sGBQs67o5n'
    },
    footer : {
      contentTypeID : 'footer',
      contentEntryID : '6Q0k5cj4fBAXj83m3uXtgx'
    }
  }
};

/*
Placeholder images to use in development
Unsplash images can be optimized with query parameters:
w, h: for adjusting the width and height of a photo
crop: for applying cropping to the photo
fm: for converting image format
auto=format: for automatically choosing the optimal image format depending on user browser
q: for changing the compression quality when using lossy file formats
fit: for changing the fit of the image within the specified dimensions
dpi: for adjusting the device pixel ratio of the image
*/
export const DEV_IMAGES = {
  food : [
    'https://images.unsplash.com/photo-1559275117-d096eb5d85b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?ixlib=rb-1.2.1',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1515215316771-2742baa337f4?ixlib=rb-1.2.1',
    'https://images.unsplash.comphoto-1456324463128-7ff6903988d8ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1487014679447-9f8336841d58?ixlib=rb-1.2.1'
  ],
  nature : [
    'https://images.unsplash.com/photo-1557943819-b09ae5a1375c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1557652646-c4efca50f2de?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1556814278-8906c7d3a05f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1556610626-9976884aae5b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1553548146-50f0bdf09f0e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550621310-5b0598adcac8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550651672-e5f43068b885?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1547950515-e652d0f50b1b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9'
  ],
  businessAndWork : [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1',
    'https://images.unsplash.com/photo-1546146830-2cca9512c68e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550622824-c11e494a4b65?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550645612-83f5d594b671?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1549921296-bc643ead1e65?ixlib=rb-1.2.1',
    'https://images.unsplash.com/photo-1550063873-ab792950096b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9'
  ],
  patternsAndTextures : [
    'https://images.unsplash.com/photo-1552363451-885c4ba31879?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1557411197-336ed936e9fa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1537292092495-88d055b782a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1555516075-b5b8372c2517?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1556139943-4bdca53adf1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1514964420691-1eb9a8232581?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1521133573892-e44906baee46?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1555069811-3fce6ac918e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1554328103-f1ab574c5a12?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1523540500678-a7637c980022?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1524401879945-4499cb54166e?ixlib=rb-1.2.1',
    'https://images.unsplash.com/photo-1549491588-71989b5b39f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550353185-761a5da3ee96?ixlib=rb-1.2.1',
    'https://images.unsplash.com/photo-1550537687-c91072c4792d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550411335-cab6040bb5b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550353127-b0da3aeaa0ca?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9',
    'https://images.unsplash.com/photo-1550684848-86a5d8727436?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9'
  ]
};

export const LAMBDA_END_POINT = (IS_DEV ?
  'http://localhost:9000/.netlify/functions/server' :
  '/.netlify/functions/server'
);

export const LAMBDA_FUNCTIONS = {
  exampleName : '/example-endpoint'
};

// Project colours
export const COLOURS = {
  black : '#000',
  white : '#fff'
};

export const RESOLUTION = Math.min(1.6, window.devicePixelRatio) || 1;

export const NAV_HEIGHT = {
  desktop : 150,
  tablet : 120,
  phone : 120
};
