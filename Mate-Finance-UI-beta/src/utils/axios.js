import axios from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => {
    if (res?.status === 200 && res?.data) {
      return res?.data;
    }
  },
  (error) => {
    const responseStatus = error?.response?.status;

    if (responseStatus === 401) {
      // window.location = '/403';
    } else {
      // Proceed with the existing error handling logic
      return Promise.reject(error?.response?.data?.message || 'Something went wrong');
    }
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const getIP = () => {
  return new Promise((res, rej) => {
    axios
      .get('https://ipinfo.io/json?token=5d6fb996174d78')
      .then(({ data }) => {
        if (data.ip) {
          res(data.ip);
        } else {
          res('');
        }
      })
      .catch((error) => {
        console.log(error);
        rej(error);
      });
  });
};

export function jwtDecode(token) {
  if (token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new Uint8Array(rawData.length);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < rawData.length; i++) {
      buffer[i] = rawData.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    const jsonPayload = decoder.decode(buffer);
    return JSON.parse(jsonPayload);
  }
}

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/lender/signin',
    register: '/lender/signup',
    getIP: 'https://apiip.net/api/check?accessKey=b388944a-e2bf-4b33-bebd-1d9dc5ffa663',
    getCity: '/country/getCitiesByCountry',
    getUserInfo: '/users/get',
  },
  app: {
    onBoarding: '/lender/lenderOnBoarding',
    getAllLenders: '/lender/getLender',
    getAllLendingReq: '/lender/getAllLendingRequest',
    updateRejectWallet: '/lender/updateLenderWalletAddress',
    getLenderById: '/lender/getLenderById',
    updateStatusLender: '/lender/updateStatusOfLender',
    createDeal: '/marketPlaces/createDeal',
    updateDeal: '/marketPlaces/updateDeal',
    rejectDeal: '/marketPlaces/rejectDeal',
    getAllDeals: '/marketPlaces/getAlldeals',
    getDealById: '/marketPlaces/getdealsById/',
    getTokenizedReq: '/borrower/getAllBorrower',
    getBorrowerById: '/borrower/getBorrowerById',
    getExtInvoice: '/invoices/invoice-view/',
    lendNow: '/lender/lendNow',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
