import { Request, Response } from "express";

import { Roles } from "../../config/types";
import client from "../db/db";

import { createUser, getUserByEmail } from "../models/user";
import { createTrack, deleteTrackById, getAllTracks } from "../models/track";
import { generateJWT, verifyToken } from "../../config/services";
import {
  createImage,
  deleteImageById,
  deleteImageByTrackId,
  getImagesByTrackId,
} from "../models/images";

export async function checkUserHandler(
  req: Request,
  res: Response
): Promise<Response | void> {
  const { token } = req.body;

  try {
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((email) => email.trim())
      : [];
    const payload = await verifyToken(token);

    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const role: Roles = ADMIN_EMAILS.includes(payload.email) ? "admin" : "user";

    let user = await getUserByEmail(client, payload.email.trim());

    if (!user) {
      user = await createUser(client, {
        user_id: payload.sub!,
        email: payload.email!,
        user_name: payload.name!,
        picture: payload.picture || "",
        role: role,
      });
    }

    if (user.role !== role) {
      const query = "UPDATE table1 SET role = $1 WHERE user_id = $2";
      await client.query(query, [role, user.user_id]);
      user.role = role;
    }

    const tracks = await getAllTracks(client);
    const jwtToken = generateJWT(user);

    res.status(201).json({ token: jwtToken, user, tracks });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}

export async function createTrackHandler(req: Request, res: Response) {
  const { email, track_name, track_kind, gpx_data } = req.body;
  try {
    let user = await getUserByEmail(client, email);
    await createTrack(
      client,
      email,
      user.user_name,
      track_name,
      track_kind,
      gpx_data
    );
    const trackData = await getAllTracks(client);

    res.status(201).json({ trackData });
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function createImageHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { track_id, email, image_name, coordinates } = req.body;
  const image_data = req.file?.buffer;
  if (!image_data) {
    res.status(400).json({ message: "Файл не был передан" });
    return;
  }

  try {
    await createImage(
      client,
      Number(track_id),
      email,
      image_name,
      image_data,
      coordinates
    );
    const images = await getImagesByTrackId(client, track_id);
    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function getImagesHandler(req: Request, res: Response) {
  const { track_id } = req.body;
  try {
    const images = await getImagesByTrackId(client, track_id);
    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function deleteImageHandler(req: Request, res: Response) {
  const { image_id } = req.body;
  try {
    const track_id = await deleteImageById(client, image_id);
    const images = await getImagesByTrackId(client, track_id);
    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function deleteTrackHandler(req: Request, res: Response) {
  const { track_id } = req.body;
  try {
    await deleteTrackById(client, track_id);
    await deleteImageByTrackId(client, track_id);
    const tracks = await getAllTracks(client);
    res.status(200).json({ tracks });
  } catch (error) {
    res.status(500).json(error);
  }
}
