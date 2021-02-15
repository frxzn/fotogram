const data = {
  users: [
    {
      position: 0,
      user: {
        pk: '7719696',
        username: 'aaa',
        full_name: 'AAA',
        is_private: false,
        profile_pic_url:
          'https://instagram.ftuc1-1.fna.fbcdn.net/v/t51.2885-19/s150x150/130545621_2785725668422755_470663131431206277_n.jpg?_nc_ht=instagram.ftuc1-1.fna.fbcdn.net&_nc_ohc=XvpzPruMcioAX_veJZF&tp=1&oh=839dcf5719a6d59351f9e210e227f46c&oe=6051AEF5',
      },
    },
    {
      position: 1,
      user: {
        pk: '8819329',
        username: 'aaabbb',
        full_name: 'AAABBB',
        is_private: false,
        profile_pic_url:
          'https://instagram.ftuc1-1.fna.fbcdn.net/v/t51.2885-19/s150x150/83519882_189711442138460_7962600695104798720_n.jpg?_nc_ht=instagram.ftuc1-1.fna.fbcdn.net&_nc_ohc=J9W17fDhyHcAX8Pv34y&tp=1&oh=79be168cf5a7bc1e80159f7c2884f6f4&oe=60536C0B',
      },
    },
    {
      position: 2,
      user: {
        pk: '276904347',
        username: 'aaabbbccc',
        full_name: 'AAABBBCCC',
        is_private: true,
        profile_pic_url:
          'https://instagram.ftuc1-1.fna.fbcdn.net/v/t51.2885-19/s150x150/144120991_1150268868736339_6678489060807101017_n.jpg?_nc_ht=instagram.ftuc1-1.fna.fbcdn.net&_nc_ohc=1CVVPh4TPTQAX8IAimY&tp=1&oh=a00cb71125551436681fcc1cf15e7767&oe=6051F845',
      },
    },
  ],
  status: 'ok',
};

export const mock = (qs) => {
  return {
    users: data.users.filter((item) => item.user.username.includes(qs)),
  };
};
