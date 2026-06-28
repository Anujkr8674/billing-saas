"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from "next/headers";

export async function getUserProfile() {
  const session = await getSession();
  if (!session) return null;

  const role = session.role; // "ADMIN" or "USER"
  const userId = session.userId;

  if (!userId) return null;

  if (role === "ADMIN") {
    const admin = await prisma.admin.findUnique({ where: { id: userId } });
    if (!admin) return null;
    return {
      id: admin.id,
      role: "admin",
      name: admin.name,
      email: admin.email,
      companyLogo: null,
      planName: null,
      sidebarTheme: admin.sidebarTheme,
      recentColors: admin.recentColors,
    };
  }

  // Handle user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscription: {
        include: { plan: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    role: "user",
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    companyLogo: user.profile?.companyLogo || null,
    authorizedSignature: user.profile?.authorizedSignature || null,
    companyStamp: user.profile?.companyStamp || null,
    planName: "Free Plan",
    hasWatermark: false,
    profile: user.profile,
  };
}

export async function uploadCompanyLogo(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    throw new Error("Unauthorized");
  }

  const file = formData.get("logo") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user) throw new Error("User not found");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'png';
  const filename = `logo-${Date.now()}.${ext}`;
  const filePath = `userlogo/${user.id}/${filename}`;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  // Import dynamically to avoid top-level require errors if not installed properly
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceKey);

  // Upload to Supabase Storage bucket 'assets'
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/png',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('assets')
    .getPublicUrl(filePath);
    
  const publicPath = publicUrlData.publicUrl;
  
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      companyLogo: publicPath
    },
    update: {
      companyLogo: publicPath
    }
  });
  
  return { success: true, url: publicPath };
}

export async function updateBusinessProfile(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    throw new Error("Unauthorized");
  }

  const companyName = formData.get("companyName") as string;
  const companyCode = formData.get("companyCode") as string;
  const ownerName = formData.get("ownerName") as string;
  const email = formData.get("email") as string;
  const mobileNumber = formData.get("mobileNumber") as string;
  const gstNumber = formData.get("gstNumber") as string;
  const panCardNumber = formData.get("panCardNumber") as string;
  
  const addressLine1 = formData.get("addressLine1") as string;
  const addressLine2 = formData.get("addressLine2") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;
  const country = formData.get("country") as string;

  if (!companyName || !companyCode || !ownerName || !email || !mobileNumber || !addressLine1 || !city || !state || !pincode) {
    throw new Error("Missing required fields");
  }

  await prisma.userProfile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      companyName, companyCode, ownerName, email, mobileNumber, gstNumber, panCardNumber,
      addressLine1, addressLine2, city, state, pincode, country
    },
    update: {
      companyName, companyCode, ownerName, email, mobileNumber, gstNumber, panCardNumber,
      addressLine1, addressLine2, city, state, pincode, country
    }
  });

  return { success: true };
}

export async function updateThemeSettings(theme: string, recentColors: string[], role: "admin" | "user") {
  const session = await getSession();
  if (!session) return { success: false };

  const cookieStore = await cookies();
  
  if (role === "admin") {
    await prisma.admin.update({
      where: { id: session.userId },
      data: {
        sidebarTheme: theme,
        recentColors: JSON.stringify(recentColors)
      }
    });
    cookieStore.set('adminSidebarTheme', encodeURIComponent(theme), { path: '/', maxAge: 31536000 });
  } else {
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });
    if (userProfile) {
      await prisma.userProfile.update({
        where: { userId: session.userId },
        data: {
          sidebarTheme: theme,
          recentColors: JSON.stringify(recentColors)
        }
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId: session.userId,
          sidebarTheme: theme,
          recentColors: JSON.stringify(recentColors)
        }
      });
    }
    cookieStore.set('userSidebarTheme', encodeURIComponent(theme), { path: '/', maxAge: 31536000 });
  }

  return { success: true };
}

export async function uploadSignature(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "USER") throw new Error("Unauthorized");

  const file = formData.get("signature") as File | null;
  if (!file) throw new Error("No file provided");

  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user) throw new Error("User not found");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'png';
  const filename = `signature-${Date.now()}.${ext}`;
  const filePath = `userlogo/${user.id}/${filename}`;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) throw new Error("Supabase credentials not configured");

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase.storage.from('assets').upload(filePath, buffer, {
    contentType: file.type || 'image/png',
    upsert: true
  });

  if (error) throw new Error(`Failed to upload to Supabase: ${error.message}`);
  
  const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(filePath);
  const publicPath = publicUrlData.publicUrl;
  
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, authorizedSignature: publicPath },
    update: { authorizedSignature: publicPath }
  });
  
  return { success: true, url: publicPath };
}

export async function uploadCompanyStamp(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "USER") throw new Error("Unauthorized");

  const file = formData.get("stamp") as File | null;
  if (!file) throw new Error("No file provided");

  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user) throw new Error("User not found");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'png';
  const filename = `stamp-${Date.now()}.${ext}`;
  const filePath = `userlogo/${user.id}/${filename}`;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) throw new Error("Supabase credentials not configured");

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase.storage.from('assets').upload(filePath, buffer, {
    contentType: file.type || 'image/png',
    upsert: true
  });

  if (error) throw new Error(`Failed to upload to Supabase: ${error.message}`);
  
  const { data: publicUrlData } = supabase.storage.from('assets').getPublicUrl(filePath);
  const publicPath = publicUrlData.publicUrl;
  
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, companyStamp: publicPath },
    update: { companyStamp: publicPath }
  });
  
  return { success: true, url: publicPath };
}
