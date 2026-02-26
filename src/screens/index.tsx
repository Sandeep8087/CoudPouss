import Splash from './Splash';
import Login from './auth/Login';
import BottomBar from './Bottombar';
import CreateRequest from './request/CreateRequest';
import ResetPassword from './auth/ResetPassword';
import Otp from './auth/Otp';
import NewPassword from './auth/NewPassword';
import SignupSelect from './auth/SignupSelect';
import Signup from './auth/Signup';
import CreatePassword from './auth/CreatePassword';
import AddPersonalDetails from './auth/AddPersonalDetails';
import ChooseYourSubscription from './subscription/ChooseYourSubscription';
import SelectedPlanDetails from './subscription/SelectedPlanDetails';
import PaymentMethod from './subscription/PaymentMethod';
import SubscriptionSuccessful from './subscription/SubscriptionSuccessful';
import AdditionalDetails from './subscription/AdditionalDetails';
import YearsOfExperience from './subscription/YearsOfExperience';
import AddServices from './subscription/AddServices';
import AddBankDetails from './subscription/AddBankDetails';
import ReviewServices from './subscription/ReviewServices';
import AccountCreatedSuccessfully from './subscription/AccountCreatedSuccessfully';
import ChatDetails from './chat/ChatDetails';
import Thankyou from './request/Thankyou';
import RequestDetails from './request/RequestDetails';
import OtherUserProfile from './profile/OtherUserProfile';
import ServiceConfirmed from './request/ServiceConfirmed';
import Notification from './notification/Notification';
import CompletedTaskDetails from './task/CompletedTaskDetails';
import WriteReview from './review/WriteReview';
import TaskStatus from './task/TaskStatus';
import Assistance from './houseAssistance/Assistance';
import Transport from './houseAssistance/Transport';
import ServicePreview from './service/ServicePreview';
import AddQuote from './service/AddQuote';
import Success from './service/Success';
import ProfessionalTaskDetails from './task/ProfessionalTaskDetails';
import ProfessionalTaskStatus from './task/ProfessionalTaskStatus';
import ExploreServiceRequest from './service/ExploreServiceRequest';

//BOTTOMBAR
import Home from './home/Home';
import Request from './request/Request';
import Chat from './chat/Chat';
import Profile from './profile/Profile';
import ProfessionalHome from './home/ProfessionalHome';
import OpenRequestDetails from './task/OpenRequestDetails';

//PROFILE
import MyProfile from './profile/MyProfile';
import RatingsReviews from './profile/RatingsReviews';
import Transactions from './profile/Transactions';
import Notifications from './profile/Notifications';
import MyProfileProfessional from './profile/MyProfileProfessional';
import EditProfile from './profile/EditProfile';
import ApplicationStatus from './profile/ApplicationStatus';
import ManageServices from './profile/ManageServices';
import MyEarnings from './profile/MyEarnings';
import BankDetails from './profile/BankDetails';
import WithdrawHistory from './profile/WithdrawHistory';
import MoneyWithdrawal from './profile/MoneyWithdrawal';
import ManageSubscription from './subscription/ManageSubscription';
import Favourites from './home/Favourites';
import Task from './task/Task';
import ServiceCancelled from './request/ServiceCancelled';
import Search from './home/Search';
import WebViewScreen from './WebViewScreen';
import MapView from './task/MapView';
import NegotiationDetails from './chat/NegotiationDetails';

export const SCREENS = {
  Splash: {
    identifier: 'Splash',
    component: Splash,
  },
  Login: {
    identifier: 'Login',
    component: Login,
  },
  BottomBar: {
    identifier: 'BottomBar',
    component: BottomBar,
  },

  ResetPassword: {
    identifier: 'ResetPassword',
    component: ResetPassword,
  },
  Otp: {
    identifier: 'Otp',
    component: Otp,
  },
  NewPassword: {
    identifier: 'NewPassword',
    component: NewPassword,
  },
  SignupSelect: {
    identifier: 'SignupSelect',
    component: SignupSelect,
  },
  Signup: {
    identifier: 'Signup',
    component: Signup,
  },
  CreatePassword: {
    identifier: 'CreatePassword',
    component: CreatePassword,
  },
  AddPersonalDetails: {
    identifier: 'AddPersonalDetails',
    component: AddPersonalDetails,
  },
  ChooseYourSubscription: {
    identifier: 'ChooseYourSubscription',
    component: ChooseYourSubscription,
  },
  SelectedPlanDetails: {
    identifier: 'SelectedPlanDetails',
    component: SelectedPlanDetails,
  },
  PaymentMethod: {
    identifier: 'PaymentMethod',
    component: PaymentMethod,
  },
  SubscriptionSuccessful: {
    identifier: 'SubscriptionSuccessful',
    component: SubscriptionSuccessful,
  },
  AdditionalDetails: {
    identifier: 'AdditionalDetails',
    component: AdditionalDetails,
  },
  YearsOfExperience: {
    identifier: 'YearsOfExperience',
    component: YearsOfExperience,
  },
  AddServices: {
    identifier: 'AddServices',
    component: AddServices,
  },
  AddBankDetails: {
    identifier: 'AddBankDetails',
    component: AddBankDetails,
  },
  ReviewServices: {
    identifier: 'ReviewServices',
    component: ReviewServices,
  },
  AccountCreatedSuccessfully: {
    identifier: 'AccountCreatedSuccessfully',
    component: AccountCreatedSuccessfully,
  },
  MyProfile: {
    identifier: 'MyProfile',
    component: MyProfile,
  },
  RatingsReviews: {
    identifier: 'RatingsReviews',
    component: RatingsReviews,
  },
  Transactions: {
    identifier: 'Transactions',
    component: Transactions,
  },
  Notifications: {
    identifier: 'Notifications',
    component: Notifications,
  },
  ChatDetails: {
    identifier: 'ChatDetails',
    component: ChatDetails,
  },
  Thankyou: {
    identifier: 'Thankyou',
    component: Thankyou,
  },
  RequestDetails: {
    identifier: 'RequestDetails',
    component: RequestDetails,
  },
  OtherUserProfile: {
    identifier: 'OtherUserProfile',
    component: OtherUserProfile,
  },
  ServiceConfirmed: {
    identifier: 'ServiceConfirmed',
    component: ServiceConfirmed,
  },
  Notification: {
    identifier: 'Notification',
    component: Notification,
  },
  CompletedTaskDetails: {
    identifier: 'CompletedTaskDetails',
    component: CompletedTaskDetails,
  },
  WriteReview: {
    identifier: 'WriteReview',
    component: WriteReview,
  },
  TaskStatus: {
    identifier: 'TaskStatus',
    component: TaskStatus,
  },
  Assistance: {
    identifier: 'Assistance',
    component: Assistance,
  },
  Transport: {
    identifier: 'Transport',
    component: Transport,
  },
  ServicePreview: {
    identifier: 'ServicePreview',
    component: ServicePreview,
  },
  AddQuote: {
    identifier: 'AddQuote',
    component: AddQuote,
  },
  Success: {
    identifier: 'Success',
    component: Success,
  },
  ProfessionalTaskDetails: {
    identifier: 'ProfessionalTaskDetails',
    component: ProfessionalTaskDetails,
  },
  MyProfileProfessional: {
    identifier: 'MyProfileProfessional',
    component: MyProfileProfessional,
  },
  EditProfile: {
    identifier: 'EditProfile',
    component: EditProfile,
  },
  ApplicationStatus: {
    identifier: 'ApplicationStatus',
    component: ApplicationStatus,
  },
  ManageServices: {
    identifier: 'ManageServices',
    component: ManageServices,
  },
  MyEarnings: {
    identifier: 'MyEarnings',
    component: MyEarnings,
  },
  BankDetails: {
    identifier: 'BankDetails',
    component: BankDetails,
  },
  WithdrawHistory: {
    identifier: 'WithdrawHistory',
    component: WithdrawHistory,
  },
  MoneyWithdrawal: {
    identifier: 'MoneyWithdrawal',
    component: MoneyWithdrawal,
  },
  ManageSubscription: {
    identifier: 'ManageSubscription',
    component: ManageSubscription,
  },
  ProfessionalTaskStatus: {
    identifier: 'ProfessionalTaskStatus',
    component: ProfessionalTaskStatus,
  },
  Favourites: {
    identifier: 'Favourites',
    component: Favourites,
  },
  CreateRequest: {
    identifier: 'CreateRequest',
    component: CreateRequest,
  },
  OpenRequestDetails: {
    identifier: 'OpenRequestDetails',
    component: OpenRequestDetails,
  },
  ServiceCancelled: {
    identifier: 'ServiceCancelled',
    component: ServiceCancelled,
  },
  Search: {
    identifier: 'Search',
    component: Search,
  },
  ExploreServiceRequest: {
    identifier: 'ExploreServiceRequest',
    component: ExploreServiceRequest,
  },
  WebViewScreen: {
    identifier: 'WebViewScreen',
    component: WebViewScreen,
  },
  MapView: {
    identifier: 'MapView',
    component: MapView,
  },
  NegotiationDetails: {
    identifier: 'NegotiationDetails',
    component: NegotiationDetails,
  },
};

export const TABS = {
  Home: {
    identifier: 'Home',
    component: Home,
  },
  Request: {
    identifier: 'Request',
    component: Request,
  },

  Chat: {
    identifier: 'Chat',
    component: Chat,
  },
  Profile: {
    identifier: 'Profile',
    component: Profile,
  },
  ProfessionalHome: {
    identifier: 'ProfessionalHome',
    component: ProfessionalHome,
  },
  Task: {
    identifier: 'Task',
    component: Task,
  },
};
