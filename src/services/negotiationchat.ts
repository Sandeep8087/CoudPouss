import firestore from '@react-native-firebase/firestore';


/* =========================
   Create User Thread
========================= */

export const buildThreadId = (first: string, second: string) =>
  [first, second].sort().join('_');

// export const createNewThread = (
//   userId: string,
//   userName: string,
//   userEmail: string,
//   userMobile: string,
//   userRole: string,
//   userAddress: string,
//   userImage: string,
// ): Promise<void> => {
//   return firestore()
//     .collection('Users')
//     .doc(userId)
//     .set({
//       name: userName,
//       userId: userId,
//       email: userEmail,
//       mobile: userMobile,
//       role: userRole,
//       address: userAddress,
//       avatarUrl: userImage,
//       text: `${userName} created.`,
//       createdAt: new Date().getTime(),
//     });
// };

// /* =========================
//    Single negotiation User Message
// ========================= */

// export const negotiationMessage = async (
//   serviceName: string,
//   userId: string,
//   recipientId: string,
//   title: string,
//   type: string,
//   message: string,
//   conversationId: string,
// ): Promise<any> => {


//   return await firestore()
//     .collection('Users')
//     .doc(userId)
//     .collection('NEGOTIATION_MESSAGES')
//     .doc(conversationId)
//     .set(

//       { merge: true },
//     )
//     .then(() => {
//       return firestore()
//         .collection('Users')
//         .doc(recipientId)
//         .collection('NEGOTIATION_MESSAGES')
//         .doc(conversationId)
//         .set(

//           { merge: true },
//         );
//     })
//     .then(() => {
//       return firestore()
//         .collection('NEGOTIATION_MESSAGES')
//         .doc(conversationId)
//         .collection('NEGOTIATION_MESSAGE_THREADS')
//         .add({
//           serviceName: serviceName,
//           title: title,
//           type: type,
//           senderId: userId,
//           receiverId: recipientId,
//           text: message,
//           createdAt: new Date().getTime(),
//         });
//     });
// };

/* =========================
   Single User Message
========================= */
export const userNegotiationMessage = async (
  serviceId: string,
  quoteId: string,
  serviceName: string,
  servicePhoto: string,
  userId: string,
  userName: string,
  recipientId: string,
  recipientName: string,
  conversationId: string,
  payload: {
    type: string;
    text: string;
    negotiation: NegotiationPayload;
  },
  userPhoto: string,
  recipientPhoto: string,
): Promise<any> => {

  const previewMessage =
    payload.type === 'TEXT'
      ? payload.text
      : `Negotiation: ${payload.negotiation?.currentAmount}`;

  return await firestore()
    .collection('Users')
    .doc(userId)
    .collection('NEGOTIATION_MESSAGES')
    .doc(conversationId)
    .set(
      {
        message: previewMessage,
        createdAt: new Date().getTime(),
        readCount: 'true',
        user: {
          userId: userId,
          name: recipientName,
          recipientId: recipientId,
          recipientPhoto: recipientPhoto,
          serviceId: serviceId,
          quoteId: quoteId,
          serviceName: serviceName,
          servicePhoto: servicePhoto,
          chatVisible: 'single',
        },
      },
      { merge: true },
    )
    .then(() => {
      return firestore()
        .collection('Users')
        .doc(recipientId)
        .collection('NEGOTIATION_MESSAGES')
        .doc(conversationId)
        .set(
          {
            message: previewMessage,
            createdAt: new Date().getTime(),
            readCount: 'false',
            user: {
              userId: userId,
              name: userName,
              recipientId: userId,
              recipientPhoto: userPhoto,
              serviceId: serviceId,
              quoteId: quoteId,
              serviceName: serviceName,
              servicePhoto: servicePhoto,
              chatVisible: 'single',
            },
          },
          { merge: true },
        );
    })
    .then(() => {
      if (payload.type === 'NEGOTIATION') {
        return firestore()
          .collection('NEGOTIATION_MESSAGES')
          .doc(conversationId)
          .set({
            latestMessageId: '1',
            offers: payload.negotiation?.offers || [],
          }, { merge: true },)
          .then(() => {
            return firestore()
              .collection('NEGOTIATION_MESSAGES')
              .doc(conversationId)
              .collection('NEGOTIATION_MESSAGE_THREADS')
              .add({
                senderId: userId || '',
                receiverId: recipientId || '',
                text: payload.text || '',
                serviceId: serviceId,
                quoteId: quoteId,
                serviceName: serviceName,
                servicePhoto: servicePhoto,
                negotiation: payload.negotiation || null,
                createdAt: new Date().getTime(),
                type: payload.type || '',
              });
          });
      } else {
        return firestore()
          .collection('NEGOTIATION_MESSAGES')
          .doc(conversationId)
          .collection('NEGOTIATION_MESSAGE_THREADS')
          .add({
            senderId: userId || '',
            receiverId: recipientId || '',
            text: payload.text || '',
            serviceId: serviceId,
            quoteId: quoteId,
            negotiation: payload.negotiation || null,
            createdAt: new Date().getTime(),
            type: payload.type || '',
          });
      }
    });
};


type NegotiationPayload = {
  serviceName: string;
  quoteId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  currentTurn: string;
  currentAmount: number;
  initialQuote: number;
  originalValuation?: number;
  createdBy: string;
  createdAt: number;
  latestMessageId: string;
  offers: {
    amount: number;
    by: string;
    label?: string;
    userName?: string;
    createdAt: number;
  }[];
};

export const getNegotiationFieldData = async (conversationId: string) => {
  const docSnap = await firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(conversationId)
    .get();

  if (docSnap.exists) {
    return docSnap.data();
  }
};
/* =========================
   Listeners
========================= */

// export const updateMessage = async (conversationId: string, messageId: string, data: any) => {
//   return await firestore()
//     .collection('NEGOTIATION_MESSAGES')
//     .doc(conversationId)
//     .collection('NEGOTIATION_MESSAGE_THREADS')
//     .doc(messageId)
//     .update(data);
// };
export const listenToNegotiationThreads = (UserID: string) => {
  return firestore()
    .collection('Users')
    .doc(UserID)
    .collection('NEGOTIATION_MESSAGES')
    .orderBy('createdAt', 'desc');
};

export const isThreadExists = async (threadId: string) => {
  const docSnap = await firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(threadId)
    .collection('NEGOTIATION_MESSAGE_THREADS')
    .get();

  return docSnap.docs.length > 0 ? '1' : '0';
};
// export const getPrividerbyId = async (providerId: string) => {
//   return await firestore()
//     .collection('Users')
//     .doc(providerId).collection('NEGOTIATION_MESSAGES')
//     .get();
// };

export const messagesListThread = (threadId: string) => {
  return firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(threadId)
    .collection('NEGOTIATION_MESSAGE_THREADS')
    .orderBy('createdAt', 'desc');
};

export const messagesNegotiationListThread = (threadId: string) => {
  return firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(threadId)
    .collection('NEGOTIATION_MESSAGE_THREADS')
    .orderBy('createdAt', 'desc');
};

/* =========================
   Remove Conversation
========================= */

export const removeDocument = (
  userId: string,
  conversationId: string,
): Promise<void> => {
  return firestore()
    .collection('Users')
    .doc(userId)
    .collection('NEGOTIATION_MESSAGES')
    .doc(conversationId)
    .delete();
};

export const removeThread = (
  conversationId: string,
): Promise<void> => {
  return firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(conversationId)
    .delete();
};

/* =========================
   Counter Negotiation
========================= */

// export const counterNegotiation = async ({
//   conversationId,
//   messageId,
//   userId,
//   amount,
//   label,
//   userName,
// }: {
//   conversationId: string;
//   messageId: string;
//   userId: string;
//   amount: number;
//   label: string;
//   userName: string;
// }): Promise<void> => {
//   const messageRef = firestore()
//     .collection('NEGOTIATION_MESSAGES')
//     .doc(conversationId)
//     .collection('NEGOTIATION_MESSAGE_THREADS')
//     .doc(messageId);

//   await firestore().runTransaction(async transaction => {
//     const snap = await transaction.get(messageRef);

//     if (!snap.exists) {
//       throw new Error('Negotiation message not found');
//     }

//     const data = snap.data();
//     const existingNegotiation: NegotiationPayload = data?.negotiation;

//     if (existingNegotiation.status === 'ACCEPTED') {
//       throw new Error('Negotiation already finalized');
//     }

//     const lastOffer =
//       existingNegotiation.offers?.[
//       existingNegotiation.offers.length - 1
//       ];

//     if (lastOffer?.by === userId) {
//       throw new Error('Not your turn');
//     }

//     const updatedNegotiation: NegotiationPayload = {
//       ...existingNegotiation,
//       currentAmount: amount,
//       offers: [
//         ...(existingNegotiation.offers || []),
//         {
//           amount,
//           by: userId,
//           label: label,
//           userName: userName,
//           createdAt: new Date().getTime(), // keeping your existing pattern
//         },
//       ],
//     };

//     transaction.update(messageRef, {
//       negotiation: updatedNegotiation,
//     });
//   });
// };

/* =========================
   Accept Negotiation
========================= */

export const acceptNegotiation = async (conversationId: string, messageId: string) => {
  return await firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(conversationId)
    .collection('NEGOTIATION_MESSAGE_THREADS')
    .doc(messageId)
    .set({
      negotiation: {
        status: 'ACCEPTED',
      },
    }, { merge: true });
};
// export const acceptNegotiation = async ({
//   conversationId,
//   messageId,
//   userId,
//   userName,
// }: {
//   conversationId: string;
//   messageId: string;
//   userId: string;
//   userName: string;
// }): Promise<void> => {
//   const messageRef = firestore()
//     .collection('NEGOTIATION_MESSAGES')
//     .doc(conversationId)
//     .collection('NEGOTIATION_MESSAGE_THREADS')
//     .doc(messageId);

//   await firestore().runTransaction(async transaction => {
//     const snap = await transaction.get(messageRef);

//     if (!snap.exists) {
//       throw new Error('Negotiation message not found');
//     }

//     const data = snap.data();
//     const existingNegotiation: NegotiationPayload = data?.negotiation;

//     if (existingNegotiation.status === 'ACCEPTED') {
//       throw new Error('Negotiation already finalized');
//     }

//     const lastOffer =
//       existingNegotiation.offers?.[
//       existingNegotiation.offers.length - 1
//       ];

//     const updatedNegotiation: NegotiationPayload = {
//       ...existingNegotiation,
//       status: 'ACCEPTED',
//       currentAmount: lastOffer?.amount,
//       offers: [
//         ...(existingNegotiation.offers || []),
//         {
//           amount: lastOffer?.amount,
//           by: userId,
//           label: 'ACCEPT',
//           userName: userName,
//           createdAt: new Date().getTime(),
//         },
//       ],
//     };

//     transaction.set(messageRef, {
//       negotiation: updatedNegotiation,
//     });
//   });
// };