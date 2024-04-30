import { useEffect, useState } from 'react';

// @mui
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
// utils
import moment from 'moment';
import { useLocales } from 'src/locales';
// import { lang } from 'src/locales/multiLang';
import { TimelineSeparator } from '@mui/lab';

// ----------------------------------------------------------------------

export default function FinanceStatusTimeLine({ invoice }) {
  const rej = `Rejected`;
  const [steps, setSteps] = useState([
    {
      label: `Finance Request`,
    },
    {
      label: `Tokenized`,
    },
    {
      label: `Lending`,
    },
    {
      label: `Closed`,
    },
    {
      label: `Repayment`,
    },
  ]);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (invoice) {
      addDateInStatus(
        invoice.financeRequest?.status ? invoice.financeRequest?.statusDate : null,
        invoice.tokenized?.status ? invoice.tokenized?.statusDate : null,
        invoice.lending?.rejected?.status ? invoice.lending?.rejected?.statusDate : null,
        invoice.closed?.status ? invoice.closed?.statusDate : null,
        invoice.repayment?.status ? invoice.repayment?.statusDate : null
      );
    }
  }, [invoice]);

  const addDateInStatus = (progressDate, approvedDate, rejectDate, disbursed, rePaymentDate) => {
    const tempStep = [...steps];
    const cd = new Date(progressDate);
    const ad = new Date(approvedDate);
    const cpd = new Date(rejectDate);
    const dsb = new Date(disbursed);
    const pd = new Date(rePaymentDate);

    tempStep[0].description = invoice.draft ? '' : moment(cd).format('D-M-YYYY h:mm A');

    if (rejectDate) {
      tempStep[1].description = rejectDate ? moment(cpd).format('D-M-YYYY h:mm A') : '';
      tempStep[1].label = rej;
    } else {
      tempStep[1].description = approvedDate ? moment(ad).format('D-M-YYYY h:mm A') : '';
      // Add an additional label if the status is true
      if (invoice.tokenized?.status) {
        tempStep[1].additionalLabel = `Approved`;
      } else {
        tempStep[1].additionalLabel = ''; // Set to an empty string if status is false
      }
    }

    // Add an additional label for disbursed based on status
    if (invoice.financeStatusarray?.disbursed?.status) {
      tempStep[2].additionalLabel = `disbursed`;
    } else {
      tempStep[2].additionalLabel = ''; // Set to an empty string if status is false
    }
    tempStep[2].description = disbursed ? moment(dsb).format('D-M-YYYY h:mm A') : '';

    // Add an additional label for rePayment based on status
    if (invoice.financeStatusarray?.rePayment?.status) {
      tempStep[3].additionalLabel = `Repayment`;
    } else {
      tempStep[3].additionalLabel = ''; // Set to an empty string if status is false
    }
    tempStep[3].description = rePaymentDate ? moment(pd).format('D-M-YYYY h:mm A') : '';

    // Testing code push
    setSteps(tempStep);
  };

  return (
    <div>
      <Timeline
        sx={{
          m: 0,
          p: 3,
          display: 'flex',
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {steps.map((item, index) => (
          <OrderItem key={index} item={item} lastTimeline={index === steps.length - 1} />
        ))}
      </Timeline>
    </div>
  );
}

FinanceStatusTimeLine.propTypes = {
  invoice: PropTypes.object,
};

// ----------------------------------------------------------------------

function OrderItem({ item, lastTimeline }) {
  const { description, label, request } = item;
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot style={description ? { backgroundColor: '#5a2c66' } : {}} />
        {lastTimeline ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{label}</Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {description}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: '#50C878' }}>
          {request}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}

OrderItem.propTypes = {
  item: PropTypes.object,
  lastTimeline: PropTypes.bool,
};
