import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { sellAPI, exchangeAPI, repairAPI } from '../services/api';
import { StatusTimeline } from '../components/common/StatusTimeline';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import {
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Zap,
  Repeat,
  Wrench
} from 'lucide-react';

export const TrackingPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const type = searchParams.get('type') || 'sell';
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        let res;
        if (type === 'sell') {
          res = await sellAPI.get(id);
          setRequestData(res.data?.data?.sell_request);
        } else if (type === 'exchange') {
          res = await exchangeAPI.get(id);
          setRequestData(res.data?.data?.exchange_request);
        } else if (type === 'repair') {
          res = await repairAPI.get(id);
          setRequestData(res.data?.data?.repair_request);
        }
      } catch (err) {
        console.error("Tracking load notice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [type, id]);

  const SELL_STEPS = [
    'Requested',
    'Confirmed',
    'Agent Assigned',
    'Pickup Scheduled',
    'Picked Up',
    'Inspection',
    'Final Offer',
    'Completed'
  ];

  const REPAIR_STEPS = [
    'Requested',
    'Confirmed',
    'Agent Assigned',
    'Device Collected',
    'Under Repair',
    'Ready',
    'Completed'
  ];

  const EXCHANGE_STEPS = [
    'Requested',
    'Confirmed',
    'Agent Assigned',
    'Exchange Scheduled',
    'Completed'
  ];

  const currentSteps = type === 'repair' ? REPAIR_STEPS : type === 'exchange' ? EXCHANGE_STEPS : SELL_STEPS;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Request Status & Live Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking Code: <span className="font-mono font-bold text-slate-800">{code || requestData?.request_code || 'N/A'}</span>
          </p>
        </div>

        <Badge variant="brand" size="md">
          {type.toUpperCase()} REQUEST
        </Badge>
      </div>

      {loading ? (
        <Loader message="Fetching live request status..." />
      ) : !requestData ? (
        <Card className="text-center py-12 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900">Request Not Found</h3>
          <p className="text-xs text-slate-500">Could not find matching request records for this tracking identifier.</p>
          <Link to="/dashboard">
            <Button size="sm">Go to Dashboard</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Status Timeline Card */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifecycle Progress</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Current State: {requestData.status}
              </span>
            </div>

            <StatusTimeline
              currentStatus={requestData.status}
              steps={currentSteps}
            />
          </Card>

          {/* Request Information Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device & Valuation Card */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" /> Device & Valuation Summary
              </h3>

              <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Device:</span>
                  <span className="font-bold text-slate-900">
                    {requestData.device ? `${requestData.device.brand} ${requestData.device.model}` : requestData.target_device_name || requestData.device_name || 'Smart Device'}
                  </span>
                </div>

                {requestData.estimated_price && (
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Initial AI Estimate:</span>
                    <span className="font-semibold text-slate-700">₹{Number(requestData.estimated_price).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {requestData.final_price ? (
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500 font-bold text-emerald-700">Final Verified Offer:</span>
                    <span className="font-black text-emerald-600 text-sm">₹{Number(requestData.final_price).toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Final Offer:</span>
                    <span className="italic text-slate-400">Pending physical verification</span>
                  </div>
                )}

                {requestData.notes && (
                  <div className="pt-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-2">
                    <span className="font-bold block text-slate-700 mb-0.5">Executive Notes:</span>
                    {requestData.notes}
                  </div>
                )}
              </div>
            </Card>

            {/* Pickup & Agent Details Card */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" /> Pickup & Executive Details
              </h3>

              <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{requestData.pickup_date}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-semibold text-slate-700">{requestData.pickup_time || '10:00 AM - 01:00 PM'}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Pickup Address:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{requestData.pickup_address}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Field Agent:</span>
                  <span className="font-bold text-slate-900">
                    {requestData.agent_name ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {requestData.agent_name}
                      </span>
                    ) : (
                      <span className="text-slate-400">Assigning executive...</span>
                    )}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
