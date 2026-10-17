import React from 'react';
import { StaffDashboard } from '../components/dashboard/StaffDashboard';

/** Admin home: shared staff dashboard (hero, KPIs, requests queue, activity, fines, quick actions) */
export const AdminDashboard = () => <StaffDashboard role="admin" />;
