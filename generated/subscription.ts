/* eslint-disable */
/**
 * Auto-generated from subscription.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export const SUBSCRIPTION_PACKAGE_NAME = 'subscription';

export interface GetSubscriptionRequest {
  userId?: string;
}

export interface UpgradeToPremiumRequest {
  userId?: string;
  paymentId?: string;
}

export interface CancelPremiumRequest {
  userId?: string;
}

export interface CreatePaymentRequest {
  userId?: string;
  amount?: number;
  currency?: string;
  method?: string;
}

export interface GetPaymentHistoryRequest {
  userId?: string;
}

export interface UpdatePaymentStatusRequest {
  userId?: string;
  paymentId?: string;
  status?: string;
}

export interface Subscription {
  id?: string;
  userId?: string;
  tier?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionResponse {
  success?: boolean;
  data?: Subscription;
  message?: string;
}

export interface PaymentResponse {
  success?: boolean;
  data?: Payment;
  message?: string;
}

export interface PaymentHistoryResponse {
  success?: boolean;
  data?: Payment[];
  message?: string;
}

export interface SubscriptionService {
  GetSubscription(request: GetSubscriptionRequest): Observable<SubscriptionResponse>;
  UpgradeToPremium(request: UpgradeToPremiumRequest): Observable<SubscriptionResponse>;
  CancelPremium(request: CancelPremiumRequest): Observable<SubscriptionResponse>;
  CreatePayment(request: CreatePaymentRequest): Observable<PaymentResponse>;
  GetPaymentHistory(request: GetPaymentHistoryRequest): Observable<PaymentHistoryResponse>;
  UpdatePaymentStatus(request: UpdatePaymentStatusRequest): Observable<PaymentResponse>;
}

export const SUBSCRIPTIONSERVICE_SERVICE_NAME = 'SubscriptionService';

