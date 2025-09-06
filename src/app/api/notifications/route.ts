import { NextResponse } from 'next/server';
// import webpush from 'web-push';

// Temporarily disable web-push notification feature
// webpush.setVapidDetails(
//   'mailto:mlawal44@gmail.com',
//   process.env.VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!
// );

export async function POST() {
  // Return a dummy response to disable notifications
  return NextResponse.json(
    { disabled: true, message: 'Push notifications are temporarily disabled.' },
    { status: 200 }
  );

  /*
  try {
    const { subscription, message } = await request.json();

    if (!subscription || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify(message)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
  */
}