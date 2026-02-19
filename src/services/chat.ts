// import firestore, {
//   FirebaseFirestoreTypes,
// } from '@react-native-firebase/firestore';

// export type FirestoreUser = {
//   user_id: string;
//   name: string;
//   email?: string;
//   mobile?: string;
//   role?: string;
//   address?: string;
//   avatarUrl?: string;
// };

// export type ChatThread = {
//   id: string;
//   participantIds: string[];
//   participantsMeta?: Record<
//     string,
//     {name?: string; email?: string; avatarUrl?: string}
//   >;
//   lastMessage?: string;
//   lastMessageSenderId?: string;
//   updatedAt?: FirebaseFirestoreTypes.Timestamp | null;
// };

// export type NegotiationOffer = {
//   amount: number;
//   addedBy: 'elderly_user' | 'service_provider';
//   createdAt?: FirebaseFirestoreTypes.Timestamp | null;
// };

// export type ChatMessage = {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   createdAt?: FirebaseFirestoreTypes.Timestamp | null;
//   type: 'text' | 'negotiation';
//   text?: string;
//   serviceId?: string;
//   serviceName?: string;
//   originalAmount?: number;
//   initialQuote?: number;
//   offers?: NegotiationOffer[];
//   status?: 'pending' | 'accepted';
//   acceptedAmount?: number | null;
//   lastUpdatedBy?: string;
// };

// const USERS_COLLECTION = 'users';
// const THREADS_COLLECTION = 'threads';
// const MESSAGES_SUBCOLLECTION = 'messages';

// export const buildThreadId = (first: string, second: string) =>
//   [first, second].sort().join('__');

// export async function upsertUserProfile(user: FirestoreUser) {
//   console.log('=== upsertUserProfile Called ===');
//   console.log('Received user object:', JSON.stringify(user, null, 2));
//   console.log('user_id:', user?.user_id);

//   if (!user?.user_id) {
//     console.log('❌ ERROR: user_id is missing or undefined!');
//     console.log('User object keys:', Object.keys(user || {}));
//     return;
//   }

//   try {
//     console.log('✅ user_id exists:', user.user_id);
//     const userRef = firestore().collection(USERS_COLLECTION).doc(user.user_id);
//     const snapshot = await userRef.get();
//     const timestamp = firestore.FieldValue.serverTimestamp();

//     const exists = snapshot.exists();
//     console.log('Document exists:', exists);

//     const dataToSave = {
//       user_id: user.user_id,
//       name: user.name ?? '',
//       email: user.email ?? '',
//       mobile: user.mobile ?? '',
//       role: user.role ?? '',
//       address: user.address ?? '',
//       avatarUrl: user.avatarUrl ?? '',
//       updatedAt: timestamp,
//       createdAt: exists ? snapshot.data()?.createdAt ?? timestamp : timestamp,
//     };

//     console.log('Data to save:', JSON.stringify(dataToSave, null, 2));

//     await userRef.set(dataToSave, {merge: true});
//     console.log('✅ User successfully saved to Firebase:', user.user_id);
//   } catch (error) {
//     console.log('❌ Error saving user to Firebase:', error);
//     throw error;
//   }
// }

// export async function testFirebaseConnection() {
//   try {
//     console.log('=== Testing Firebase Connection ===');
//     const testRef = firestore().collection('test').doc('connection_test');
//     await testRef.set({
//       timestamp: firestore.FieldValue.serverTimestamp(),
//       test: true,
//       message: 'Firebase connection test',
//     });
//     console.log('✅ Firebase connection successful!');
//     return true;
//   } catch (error) {
//     console.log('❌ Firebase connection failed!', error);
//     return false;
//   }
// }

// export async function ensureThreadDocument(
//   threadId: string,
//   participants: FirestoreUser[],
// ) {
//   if (!threadId || participants.length < 2) {
//     return;
//   }

//   const doc = firestore().collection(THREADS_COLLECTION).doc(threadId);
//   const snapshot = await doc.get();
//   const timestamp = firestore.FieldValue.serverTimestamp();

//   const participantIds = participants.map(participant => participant.user_id);
//   const participantsMeta = participants.reduce(
//     (acc, participant) => ({
//       ...acc,
//       [participant.user_id]: {
//         name: participant.name ?? '',
//         email: participant.email ?? '',
//         avatarUrl: participant.avatarUrl ?? '',
//       },
//     }),
//     {},
//   );

//   if (snapshot.exists()) {
//     await doc.set(
//       {
//         participantIds,
//         participantsMeta,
//         updatedAt: timestamp,
//       },
//       {merge: true},
//     );
//     return;
//   }

//   await doc.set({
//     participantIds,
//     participantsMeta,
//     updatedAt: timestamp,
//     lastMessage: '',
//     lastMessageSenderId: '',
//   });
// }

// export function subscribeToThreads(
//   userId: string,
//   onNext: (threads: ChatThread[]) => void,
//   onError?: (error: Error) => void,
// ) {
//   return firestore()
//     .collection(THREADS_COLLECTION)
//     .where('participantIds', 'array-contains', userId)
//     .onSnapshot(
//       snapshot => {
//         const threads: ChatThread[] = snapshot.docs
//           .map(document => {
//             const data = document.data() as ChatThread;
//             return {...data, id: document.id};
//           })
//           .sort((a, b) => {
//             const aTime =
//               a.updatedAt && 'toMillis' in a.updatedAt
//                 ? (a.updatedAt as FirebaseFirestoreTypes.Timestamp).toMillis()
//                 : 0;
//             const bTime =
//               b.updatedAt && 'toMillis' in b.updatedAt
//                 ? (b.updatedAt as FirebaseFirestoreTypes.Timestamp).toMillis()
//                 : 0;
//             return bTime - aTime;
//           });
//         onNext(threads);
//       },
//       error => {
//         onError?.(error);
//       },
//     );
// }

// export function subscribeToMessages(
//   threadId: string,
//   onNext: (messages: ChatMessage[]) => void,
//   onError?: (error: Error) => void,
// ) {
//   return firestore()
//     .collection(THREADS_COLLECTION)
//     .doc(threadId)
//     .collection(MESSAGES_SUBCOLLECTION)
//     .orderBy('createdAt', 'asc')
//     .onSnapshot(
//       snapshot => {
//         const messages: ChatMessage[] = snapshot.docs.map(document => {
//           const data = document.data() as ChatMessage;
//           return {...data, id: document.id};
//         });
//         onNext(messages);
//       },
//       error => {
//         onError?.(error);
//       },
//     );
// }

// export async function sendTextMessage(payload: {
//   threadId: string;
//   text: string;
//   senderId: string;
//   receiverId: string;
// }) {
//   const text = payload.text.trim();

//   if (!text) {
//     return;
//   }

//   const timestamp = firestore.FieldValue.serverTimestamp();
//   const messageRef = firestore()
//     .collection(THREADS_COLLECTION)
//     .doc(payload.threadId)
//     .collection(MESSAGES_SUBCOLLECTION)
//     .doc();

//   await messageRef.set({
//     text,
//     senderId: payload.senderId,
//     receiverId: payload.receiverId,
//     type: 'text',
//     createdAt: timestamp,
//   });

//   await firestore().collection(THREADS_COLLECTION).doc(payload.threadId).set(
//     {
//       lastMessage: text,
//       lastMessageSenderId: payload.senderId,
//       updatedAt: timestamp,
//     },
//     {merge: true},
//   );
// }

// export async function createNegotiationMessage(payload: {
//   threadId: string;
//   senderId: string;
//   receiverId: string;
//   serviceId: string;
//   serviceName?: string;
//   originalAmount: number;
//   initialQuote: number;
//   firstOfferAmount: number;
//   addedBy: 'elderly_user' | 'service_provider';
// }) {
//   const timestamp = firestore.FieldValue.serverTimestamp();
//   const messageRef = firestore()
//     .collection(THREADS_COLLECTION)
//     .doc(payload.threadId)
//     .collection(MESSAGES_SUBCOLLECTION)
//     .doc();

//   const docData: ChatMessage = {
//     id: messageRef.id,
//     senderId: payload.senderId,
//     receiverId: payload.receiverId,
//     type: 'negotiation',
//     serviceId: payload.serviceId,
//     serviceName: payload.serviceName,
//     originalAmount: payload.originalAmount,
//     initialQuote: payload.initialQuote,
//     offers: [
//       {
//         amount: payload.firstOfferAmount,
//         addedBy: payload.addedBy,
//         createdAt: timestamp as any,
//       },
//     ],
//     status: 'pending',
//     acceptedAmount: null,
//     lastUpdatedBy: payload.addedBy,
//     createdAt: timestamp as any,
//   };

//   await messageRef.set(docData);

//   await firestore().collection(THREADS_COLLECTION).doc(payload.threadId).set(
//     {
//       lastMessage: 'Negotiation started',
//       lastMessageSenderId: payload.senderId,
//       updatedAt: timestamp,
//     },
//     {merge: true},
//   );

//   return messageRef.id;
// }

// export async function appendNegotiationOffer(payload: {
//   threadId: string;
//   messageId: string;
//   amount: number;
//   addedBy: 'elderly_user' | 'service_provider';
// }) {
//   const msgRef = firestore()
//     .collection(THREADS_COLLECTION)
//     .doc(payload.threadId)
//     .collection(MESSAGES_SUBCOLLECTION)
//     .doc(payload.messageId);

//   await firestore().runTransaction(async tx => {
//     const snap = await tx.get(msgRef);
//     if (!snap.exists) {
//       throw new Error('Negotiation message not found');
//     }
//     const data = snap.data() as ChatMessage;
//     const offers = Array.isArray(data.offers) ? data.offers.slice() : [];
//     offers.push({
//       amount: payload.amount,
//       addedBy: payload.addedBy,
//       createdAt: firestore.FieldValue.serverTimestamp() as any,
//     });
//     tx.update(msgRef, {
//       offers,
//       lastUpdatedBy: payload.addedBy,
//       updatedAt: firestore.FieldValue.serverTimestamp(),
//     } as any);
//   });
// }

// export async function acceptNegotiation(payload: {
//   threadId: string;
//   messageId: string;
// }) {
//   const msgRef = firestore()
//     .collection(THREADS_COLLECTION)
//     .doc(payload.threadId)
//     .collection(MESSAGES_SUBCOLLECTION)
//     .doc(payload.messageId);

//   await firestore().runTransaction(async tx => {
//     const snap = await tx.get(msgRef);
//     if (!snap.exists) {
//       throw new Error('Negotiation message not found');
//     }
//     const data = snap.data() as ChatMessage;
//     const offers = Array.isArray(data.offers) ? data.offers : [];
//     const latest = offers.length > 0 ? offers[offers.length - 1] : null;
//     const acceptedAmount = latest ? latest.amount : null;
//     tx.update(msgRef, {
//       status: 'accepted',
//       acceptedAmount,
//       updatedAt: firestore.FieldValue.serverTimestamp(),
//     });
//   });
// }

import firestore from '@react-native-firebase/firestore';


/* =========================
   Create User Thread
========================= */

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
      createdAt: new Date().getTime(),
    });
};

// /* =========================
//    Single negotiation User Message
// ========================= */

export const negotiationMessage = async (
  serviceName: string,
  userId: string,
  recipientId: string,
  title: string,
  type: string,
  message: string,
  conversationId: string,
): Promise<void> => {
  return firestore()
    .collection('Users')
    .doc(userId)
    .collection('NEGOTIATION_MESSAGES')
    .doc(conversationId)
    .set(

      { merge: true },
    )
    .then(() => {
      return firestore()
        .collection('Users')
        .doc(recipientId)
        .collection('NEGOTIATION_MESSAGES')
        .doc(conversationId)
        .set(

          { merge: true },
        );
    })
    .then(() => {
      return firestore()
        .collection('NEGOTIATION_MESSAGES')
        .doc(conversationId)
        .collection('MESSAGE_THREADS')
        .add({
          serviceName: serviceName,
          title: title,
          type: type,
          senderId: userId,
          receiverId: recipientId,
          text: message,
          createdAt: new Date().getTime(),
        });
    });
};

/* =========================
   Single User Message
========================= */
export const userMessage = async (
  userId: string,
  userName: string,
  recipientId: string,
  recipientName: string,
  message: string,
  conversationId: string,
  userPhoto: string,
  recipientPhoto: string,
  type: string,
): Promise<void> => {
  return await firestore()
    .collection('Users')
    .doc(userId)
    .collection('MESSAGES')
    .doc(conversationId)
    .set(
      {
        message,
        createdAt: new Date().getTime(),
        readCount: 'true',
        user: {
          userId: userId,
          name: recipientName,
          recipientId: recipientId,
          recipientPhoto: recipientPhoto,
          chatVisible: 'single',
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
            message,
            createdAt: new Date().getTime(),
            readCount: 'false',
            user: {
              userId: userId,
              name: userName,
              recipientId: userId,
              recipientPhoto: userPhoto,
              chatVisible: 'single',
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
          senderId: userId,
          text: message,
          createdAt: new Date().getTime(),
          type: type,
        });
    });
};

/* =========================
   Listeners
========================= */

export const listenToThreads = (UserID: string) => {
  return firestore()
    .collection('Users')
    .doc(UserID)
    .collection('MESSAGES')
    .orderBy('createdAt', 'desc');
};

export const getPrividerbyId = async (providerId: string) => {
  return await firestore()
    .collection('Users')
    .doc(providerId).collection('NEGOTIATION_MESSAGES')
    .get();
};

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

export const removeDocument = (
  userId: string,
  conversationId: string,
): Promise<void> => {
  return firestore()
    .collection('Users')
    .doc(userId)
    .collection('MESSAGES')
    .doc(conversationId)
    .delete();
};

