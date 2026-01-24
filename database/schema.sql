-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.community_posts (
  post_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  session_id bigint NOT NULL,
  user_id bigint,
  photo_url character varying,
  content text,
  created_at timestamp without time zone,
  CONSTRAINT community_posts_pkey PRIMARY KEY (post_id),
  CONSTRAINT community_posts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.walk_sessions(session_id),
  CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.route_points (
  point_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  route_id bigint NOT NULL,
  latitude numeric,
  longitude numeric,
  sequence bigint,
  CONSTRAINT route_points_pkey PRIMARY KEY (point_id),
  CONSTRAINT route_points_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.walk_routes(route_id)
);
CREATE TABLE public.themes (
  theme_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  theme_name character varying NOT NULL,
  description character varying,
  color_code character varying,
  icon_url character varying,
  CONSTRAINT themes_pkey PRIMARY KEY (theme_id)
);
CREATE TABLE public.user (
  user_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email character varying,
  nickname character varying,
  avatar text,
  password bigint,
  CONSTRAINT user_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.walk_routes (
  route_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  theme_id bigint NOT NULL,
  route_name character varying,
  total_distance bigint,
  estimated_time bigint,
  thumbnail_url character varying,
  created_at timestamp without time zone,
  CONSTRAINT walk_routes_pkey PRIMARY KEY (route_id),
  CONSTRAINT walk_routes_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(theme_id)
);
CREATE TABLE public.walk_sessions (
  session_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  route_id bigint,
  start_time timestamp without time zone,
  end_time timestamp without time zone,
  actual_distance bigint,
  actual_duration bigint,
  is_liked boolean,
  CONSTRAINT walk_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT walk_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id),
  CONSTRAINT walk_sessions_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.walk_routes(route_id)
);