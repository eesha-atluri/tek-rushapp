import { supabase } from "@/lib/supabase";

export type EventType = "Open Rush" | "Closed Rush";

export type EventItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  type: EventType;
  assignedBrotherIds: string[];
};

type SupabaseEventRow = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  type: EventType;
  event_assignments?: {
    brother_id: string;
  }[];
};

function mapEvent(row: SupabaseEventRow): EventItem {
  return {
    id: row.id,
    name: row.name,
    date: row.date || "",
    time: row.time || "",
    type: row.type,
    assignedBrotherIds:
      row.event_assignments?.map((assignment) => assignment.brother_id) || [],
  };
}

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      date,
      time,
      type,
      event_assignments (
        brother_id
      )
    `
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as SupabaseEventRow[]).map(mapEvent);
}

export async function createEvent(input: {
  name: string;
  date: string;
  time: string;
  type: EventType;
  assignedBrotherIds: string[];
}) {
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      name: input.name,
      date: input.date,
      time: input.time,
      type: input.type,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (input.assignedBrotherIds.length > 0) {
    const rows = input.assignedBrotherIds.map((brotherId) => ({
      event_id: event.id,
      brother_id: brotherId,
    }));

    const { error: assignmentError } = await supabase
      .from("event_assignments")
      .insert(rows);

    if (assignmentError) {
      throw assignmentError;
    }
  }

  return event;
}

export async function updateEvent(input: {
  id: string;
  name: string;
  date: string;
  time: string;
  type: EventType;
  assignedBrotherIds: string[];
}) {
  const { error } = await supabase
    .from("events")
    .update({
      name: input.name,
      date: input.date,
      time: input.time,
      type: input.type,
    })
    .eq("id", input.id);

  if (error) {
    throw error;
  }

  const { error: deleteAssignmentError } = await supabase
    .from("event_assignments")
    .delete()
    .eq("event_id", input.id);

  if (deleteAssignmentError) {
    throw deleteAssignmentError;
  }

  if (input.assignedBrotherIds.length > 0) {
    const rows = input.assignedBrotherIds.map((brotherId) => ({
      event_id: input.id,
      brother_id: brotherId,
    }));

    const { error: assignmentError } = await supabase
      .from("event_assignments")
      .insert(rows);

    if (assignmentError) {
      throw assignmentError;
    }
  }
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw error;
  }
}