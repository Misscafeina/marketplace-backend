const { createImageUrl } = require('../../helpers');
const { throwError } = require('../../middlewares');
const {
  findAllDealsByUserId,
  findAvgReviewsByUserId,
  findImagesByIdProduct,
  findProductForResponsesByUserId,
  findLatestMessageContentByDealId,
  findChatsbyUserId,
  findLatestMessageContentByChatId,
} = require('../../repositories');
const {
  findUserByUsername,
} = require('../../repositories/users/usersRepositories');
const { FULL_DOMAIN } = process.env;
const ownUserController = async (req, res, next) => {
  try {
    const {
      auth: { username, id },
    } = req;

    const userData = await findUserByUsername(username);
    if (!userData) throwError(404, 'usuario no existe');
    const avgReviews = await findAvgReviewsByUserId(userData.id);
    userData.avgScore = avgReviews?.avgScore || 0;
    delete userData.password;
    delete userData.verificationCode;
    delete userData.verifiedAt;
    delete userData.type;
    delete userData.taxNumber;
    if (userData.avatar) {
      userData.avatarUrl = createImageUrl(
        userData.avatar,
        userData.id,
        'users'
      );
    } else userData.avatarUrl = `${FULL_DOMAIN}/users/default-avatar.png`;

    const products = await findProductForResponsesByUserId(userData.id);

    for await (const product of products) {
      const picturesFileNames = await findImagesByIdProduct(product.id);
      if (picturesFileNames) {
        const pictures = picturesFileNames.map((picture) => {
          const url = createImageUrl(picture.fileName, product.id, 'products');
          return url;
        });
        product.images = pictures;
      }
    }
    const userChatsHistory = await findChatsbyUserId(id);
    for await (const chat of userChatsHistory) {
      if (chat.avatarBuyer) {
        chat.avatarBuyerUrl = createImageUrl(
          chat.avatarBuyer,
          chat.idBuyer,
          'users'
        );
      } else chat.avatarBuyerUrl = `${FULL_DOMAIN}/users/default-avatar.png`;
      if (chat.avatarVendor) {
        chat.avatarVendorUrl = createImageUrl(
          chat.avatarVendor,
          chat.idVendor,
          'users'
        );
      } else chat.avatarVendorUrl = `${FULL_DOMAIN}/users/default-avatar.png`;

      const picturesFileNames = await findImagesByIdProduct(chat.idProduct);
      if (picturesFileNames) {
        const pictures = picturesFileNames.map((picture) => {
          const url = createImageUrl(
            picture.fileName,
            chat.idProduct,
            'products'
          );
          return url;
        });
        chat.images = pictures;
      }
      let messages = await findLatestMessageContentByChatId(chat.id);
      messages = messages.map((msg) => {
        if (msg.idSender === chat.idBuyer) {
          msg.usernameSender = chat.usernameBuyer;
          msg.avatarSender = chat.avatarBuyerUrl;
          msg.usernameRecipient = chat.usernameVendor;
          msg.avatarRecipient = chat.avatarVendorUrl;
        } else if (msg.idSender === chat.idVendor) {
          msg.usernameSender = chat.usernameVendor;
          msg.avatarSender = chat.avatarVendorUrl;
          msg.usernameRecipient = chat.usernameBuyer;
          msg.avatarRecipient = chat.avatarBuyerUrl;
        }
        return msg;
      });
      chat.messages = messages;
    }
    const usersDealsHistory = await findAllDealsByUserId(userData.id);
    for await (const deal of usersDealsHistory) {
      if (deal.avatarBuyer) {
        deal.avatarBuyerUrl = createImageUrl(
          deal.avatarBuyer,
          deal.idBuyer,
          'users'
        );
      } else deal.avatarBuyerUrl = `${FULL_DOMAIN}/users/default-avatar.png`;
      if (deal.avatarVendor) {
        deal.avatarVendorUrl = createImageUrl(
          deal.avatarVendor,
          deal.idVendor,
          'users'
        );
      } else deal.avatarVendorUrl = `${FULL_DOMAIN}/users/default-avatar.png`;

      const picturesFileNames = await findImagesByIdProduct(deal.idProduct);
      if (picturesFileNames) {
        const pictures = picturesFileNames.map((picture) => {
          const url = createImageUrl(
            picture.fileName,
            deal.idProduct,
            'products'
          );
          return url;
        });
        deal.images = pictures;
      }
      let messages = await findLatestMessageContentByDealId(deal.idDeal);
      messages = messages.map((msg) => {
        if (msg.idSender === deal.idBuyer) {
          msg.usernameSender = deal.usernameBuyer;
          msg.avatarSender = deal.avatarBuyerUrl;
          msg.usernameRecipient = deal.usernameVendor;
          msg.avatarRecipient = deal.avatarVendorUrl;
        } else if (msg.idSender === deal.idVendor) {
          msg.usernameSender = deal.usernameVendor;
          msg.avatarSender = deal.avatarVendorUrl;
          msg.usernameRecipient = deal.usernameBuyer;
          msg.avatarRecipient = deal.avatarBuyerUrl;
        }
        return msg;
      });
      deal.messages = messages;
    }
    const dealsAsVendor = usersDealsHistory.filter((deal) => {
      return deal.usernameVendor === username;
    });
    const dealsAsBuyer = usersDealsHistory.filter((deal) => {
      return deal.usernameBuyer === username;
    });
    const response = {
      status: 'ok',
      data: {
        userData,
        products,
        productChats: userChatsHistory,
        deals: {
          selling: dealsAsVendor,
          buying: dealsAsBuyer,
        },
      },
    };

    res.status(200);
    res.send(response);
  } catch (error) {
    next(error);
  }
};

module.exports = ownUserController;
