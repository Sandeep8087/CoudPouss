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
): Promise<any> => {


  return await firestore()
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
): Promise<any> => {
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

