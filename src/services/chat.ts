import firestore, { serverTimestamp } from '@react-native-firebase/firestore';


/* =========================
   Create User Thread
========================= */

export const buildThreadId = (first: string, second: string) =>
  [first, second].sort().join('_');

export const createNewThread = (
  userId: string,
  userName: string,
  userEmail: string,
  userMobile: string,
  userRole: string,
  userAddress: string,
  userImage: string,
): Promise<void> => {
  return firestore()
    .collection('Users')
    .doc(userId)
    .set({
      name: userName,
      userId: userId,
      email: userEmail,
      mobile: userMobile,
      role: userRole,
      address: userAddress,
      avatarUrl: userImage,
      text: `${userName} created.`,
      createdAt: serverTimestamp(),
    });
};

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
//         .collection('MESSAGE_THREADS')
//         .add({
//           serviceName: serviceName,
//           title: title,
//           type: type,
//           senderId: userId,
//           receiverId: recipientId,
//           text: message,
//           createdAt: serverTimestamp(),
//         });
//     });
// };

/* =========================
   Single User Message
========================= */
export const userMessage = async (
  userId: string,
  userName: string,
  recipientId: string,
  recipientName: string,
  conversationId: string,
  text: string,
  images: string[],
  userPhoto: string,
  recipientPhoto: string,
  type: string,
  readCount: number,
): Promise<any> => {


  return await firestore()
    .collection('Users')
    .doc(userId)
    .collection('MESSAGES')
    .doc(conversationId)
    .set(
      {
        message: text,
        createdAt: serverTimestamp(),
        readCount: readCount || 0,
        user: {
          userId: userId,
          name: recipientName,
          recipientId: recipientId,
          recipientPhoto: recipientPhoto,
        },
      },
      { merge: true },
    )
    .then(() => {
      return firestore()
        .collection('Users')
        .doc(recipientId)
        .collection('MESSAGES')
        .doc(conversationId)
        .set(
          {
            message: text,
            createdAt: serverTimestamp(),
            readCount: readCount || 0,
            user: {
              userId: userId,
              name: userName,
              recipientId: userId,
              recipientPhoto: userPhoto,
            },
          },
          { merge: true },
        );
    })
    .then(() => {
      return firestore()
        .collection('MESSAGES')
        .doc(conversationId)
        .collection('MESSAGE_THREADS')
        .add({
          senderId: userId || '',
          receiverId: recipientId || '',
          text: text || '',
          images: images || [],
          type: type || '',
          createdAt: serverTimestamp(),
        });
    });
};

/* =========================
   Listeners
========================= */

// export const updateMessage = async (conversationId: string, messageId: string, data: any) => {
//   return await firestore()
//     .collection('MESSAGES')
//     .doc(conversationId)
//     .collection('MESSAGE_THREADS')
//     .doc(messageId)
//     .update(data);
// };
export const listenToThreads = (UserID: string) => {
  return firestore()
    .collection('Users')
    .doc(UserID)
    .collection('MESSAGES')
    .orderBy('createdAt', 'desc');
};

export const isThreadExists = async (threadId: string) => {
  const docSnap = await firestore()
    .collection('MESSAGES')
    .doc(threadId)
    .collection('MESSAGE_THREADS')
    .get();

  return docSnap.docs.length > 0 ? '1' : '0';
};

export const getReadCount = async (userId: string, conversationId: string) => {
  const docSnap: any = await firestore()
    .collection('Users')
    .doc(userId)
    .collection('MESSAGES')
    .doc(conversationId)
    .get();

  return docSnap.exists ? docSnap.data()?.readCount || 0 : 0;
};

export const updateReadCount = async (recipientId: string, conversationId: string) => {
  return await firestore()
    .collection('Users')
    .doc(recipientId)
    .collection('MESSAGES')
    .doc(conversationId)
    .set(
      {

        createdAt: serverTimestamp(),
        readCount: 0,

      },
      { merge: true },
    );
};

export const updateUserStatus = async (userId: string, status: string) => {
  return await firestore()
    .collection('Users')
    .doc(userId)
    .set({
      isOnline: status,
      lastActive: serverTimestamp(),
    }, { merge: true });
}

export const listenToUserStatus = (userId: string) => {
  return firestore().collection('Users').doc(userId);
};

export const getUserStatus = async (userId: string) => {
  const docSnap: any = await firestore()
    .collection('Users')
    .doc(userId)
    .get();
  return docSnap.exists ? docSnap.data()?.isOnline || false : false;
}

export const getUserLastActive = async (userId: string) => {
  const docSnap: any = await firestore()
    .collection('Users')
    .doc(userId)
    .get();
  return docSnap.exists ? docSnap.data()?.lastActive || 0 : 0;
}

// export const getPrividerbyId = async (providerId: string) => {
//   return await firestore()
//     .collection('Users')
//     .doc(providerId).collection('NEGOTIATION_MESSAGES')
//     .get();
// };

export const messagesListThread = (threadId: string) => {
  return firestore()
    .collection('MESSAGES')
    .doc(threadId)
    .collection('MESSAGE_THREADS')
    .orderBy('createdAt', 'desc');
};

export const messagesNegotiationListThread = (threadId: string) => {
  return firestore()
    .collection('NEGOTIATION_MESSAGES')
    .doc(threadId)
    .collection('MESSAGE_THREADS')
    .orderBy('createdAt', 'desc');
};

/* =========================
   Remove Conversation
========================= */

// export const removeDocument = (
//   userId: string,
//   conversationId: string,
// ): Promise<void> => {
//   return firestore()
//     .collection('Users')
//     .doc(userId)
//     .collection('MESSAGES')
//     .doc(conversationId)
//     .delete();
// };

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
//     .collection('MESSAGES')
//     .doc(conversationId)
//     .collection('MESSAGE_THREADS')
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
//           createdAt: serverTimestamp(), // keeping your existing pattern
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
//     .collection('MESSAGES')
//     .doc(conversationId)
//     .collection('MESSAGE_THREADS')
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
//           createdAt: serverTimestamp(),
//         },
//       ],
//     };

//     transaction.set(messageRef, {
//       negotiation: updatedNegotiation,
//     });
//   });
// };