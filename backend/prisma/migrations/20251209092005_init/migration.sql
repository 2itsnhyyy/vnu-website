-- CreateTable
CREATE TABLE "place" (
    "place_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "image" TEXT,
    "open_time" TEXT,
    "close_time" TEXT,
    "phone" TEXT,
    "boundary_geom" geometry(Polygon,4326) NOT NULL,

    CONSTRAINT "place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "building" (
    "building_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "floors" INTEGER,
    "image" TEXT,
    "place_id" INTEGER NOT NULL,

    CONSTRAINT "building_pkey" PRIMARY KEY ("building_id")
);

-- CreateTable
CREATE TABLE "incident" (
    "incident_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "place_id" INTEGER NOT NULL,
    "status" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "incident_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "entrance" (
    "entrance_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nearest_junction" INTEGER NOT NULL,
    "place_id" INTEGER NOT NULL,
    "geom" geometry(Point,4326) NOT NULL,

    CONSTRAINT "entrance_pkey" PRIMARY KEY ("entrance_id")
);

-- CreateTable
CREATE TABLE "routing_junction" (
    "junction_id" SERIAL NOT NULL,
    "geom" geometry(Point,4326) NOT NULL,

    CONSTRAINT "routing_junction_pkey" PRIMARY KEY ("junction_id")
);

-- CreateTable
CREATE TABLE "routing_segment" (
    "segment_id" SERIAL NOT NULL,
    "start_node" INTEGER NOT NULL,
    "end_node" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "reverse_cost" DOUBLE PRECISION NOT NULL,
    "geom" geometry(LineString,4326) NOT NULL,
    "road_id" INTEGER NOT NULL,

    CONSTRAINT "routing_segment_pkey" PRIMARY KEY ("segment_id")
);

-- CreateTable
CREATE TABLE "road" (
    "road_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "road_pkey" PRIMARY KEY ("road_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "role" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "post" (
    "post_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author" INTEGER NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "comment" (
    "comment_id" SERIAL NOT NULL,
    "content" TEXT,
    "parent" INTEGER,
    "post_id" INTEGER,
    "author" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "like_post" (
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "like_post_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateTable
CREATE TABLE "like_comment" (
    "comment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "like_comment_pkey" PRIMARY KEY ("comment_id","user_id")
);

-- CreateTable
CREATE TABLE "news" (
    "news_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("news_id")
);

-- CreateTable
CREATE TABLE "object3d" (
    "object_id" SERIAL NOT NULL,
    "building_id" INTEGER NOT NULL,
    "object_type" INTEGER,

    CONSTRAINT "object3d_pkey" PRIMARY KEY ("object_id")
);

-- CreateTable
CREATE TABLE "mesh_object" (
    "mesh_id" SERIAL NOT NULL,
    "mesh_url" TEXT NOT NULL,
    "point_id" INTEGER,
    "rotate" DOUBLE PRECISION,
    "scale" DOUBLE PRECISION,
    "object_id" INTEGER NOT NULL,

    CONSTRAINT "mesh_object_pkey" PRIMARY KEY ("mesh_id")
);

-- CreateTable
CREATE TABLE "body" (
    "body_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "object_id" INTEGER NOT NULL,

    CONSTRAINT "body_pkey" PRIMARY KEY ("body_id")
);

-- CreateTable
CREATE TABLE "face" (
    "face_id" SERIAL NOT NULL,
    "geom" geometry(PolygonZ,4326) NOT NULL,

    CONSTRAINT "face_pkey" PRIMARY KEY ("face_id")
);

-- CreateTable
CREATE TABLE "point" (
    "point_id" SERIAL NOT NULL,
    "geom" geometry(PointZ,4326) NOT NULL,

    CONSTRAINT "point_pkey" PRIMARY KEY ("point_id")
);

-- CreateTable
CREATE TABLE "node" (
    "node_id" SERIAL NOT NULL,
    "point_id" INTEGER NOT NULL,

    CONSTRAINT "node_pkey" PRIMARY KEY ("node_id")
);

-- CreateTable
CREATE TABLE "line" (
    "line_id" SERIAL NOT NULL,
    "geom" geometry(LineStringZ,4326) NOT NULL,

    CONSTRAINT "line_pkey" PRIMARY KEY ("line_id")
);

-- CreateTable
CREATE TABLE "body_comp" (
    "body_comp_id" SERIAL NOT NULL,
    "face_id" INTEGER NOT NULL,
    "body_id" INTEGER NOT NULL,

    CONSTRAINT "body_comp_pkey" PRIMARY KEY ("body_comp_id")
);

-- CreateTable
CREATE TABLE "frustum" (
    "frustum_id" SERIAL NOT NULL,
    "base_face" INTEGER NOT NULL,
    "top_face" INTEGER,
    "body_id" INTEGER NOT NULL,

    CONSTRAINT "frustum_pkey" PRIMARY KEY ("frustum_id")
);

-- CreateTable
CREATE TABLE "prism" (
    "prism_id" SERIAL NOT NULL,
    "base_face" INTEGER NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "body_id" INTEGER NOT NULL,

    CONSTRAINT "prism_pkey" PRIMARY KEY ("prism_id")
);

-- CreateTable
CREATE TABLE "pyramid" (
    "pyramid_id" SERIAL NOT NULL,
    "base_face" INTEGER NOT NULL,
    "apex" INTEGER NOT NULL,
    "body_id" INTEGER NOT NULL,

    CONSTRAINT "pyramid_pkey" PRIMARY KEY ("pyramid_id")
);

-- CreateTable
CREATE TABLE "cone" (
    "cone_id" SERIAL NOT NULL,
    "center" INTEGER NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "apex" INTEGER NOT NULL,
    "body_id" INTEGER NOT NULL,

    CONSTRAINT "cone_pkey" PRIMARY KEY ("cone_id")
);

-- CreateTable
CREATE TABLE "cylinder" (
    "cylinder_id" SERIAL NOT NULL,
    "center" INTEGER NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "body_id" INTEGER NOT NULL,

    CONSTRAINT "cylinder_pkey" PRIMARY KEY ("cylinder_id")
);

-- CreateTable
CREATE TABLE "surface" (
    "surface_id" SERIAL NOT NULL,
    "face_id" INTEGER NOT NULL,

    CONSTRAINT "surface_pkey" PRIMARY KEY ("surface_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "place_name_key" ON "place"("name");

-- AddForeignKey
ALTER TABLE "building" ADD CONSTRAINT "building_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance" ADD CONSTRAINT "entrance_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance" ADD CONSTRAINT "entrance_nearest_junction_fkey" FOREIGN KEY ("nearest_junction") REFERENCES "routing_junction"("junction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_segment" ADD CONSTRAINT "routing_segment_start_node_fkey" FOREIGN KEY ("start_node") REFERENCES "routing_junction"("junction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_segment" ADD CONSTRAINT "routing_segment_end_node_fkey" FOREIGN KEY ("end_node") REFERENCES "routing_junction"("junction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_segment" ADD CONSTRAINT "routing_segment_road_id_fkey" FOREIGN KEY ("road_id") REFERENCES "road"("road_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_author_fkey" FOREIGN KEY ("author") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_fkey" FOREIGN KEY ("author") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_fkey" FOREIGN KEY ("parent") REFERENCES "comment"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_post" ADD CONSTRAINT "like_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_post" ADD CONSTRAINT "like_post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_comment" ADD CONSTRAINT "like_comment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("comment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_comment" ADD CONSTRAINT "like_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object3d" ADD CONSTRAINT "object3d_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "building"("building_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesh_object" ADD CONSTRAINT "mesh_object_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "object3d"("object_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesh_object" ADD CONSTRAINT "mesh_object_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "point"("point_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body" ADD CONSTRAINT "body_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "object3d"("object_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node" ADD CONSTRAINT "node_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "point"("point_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_comp" ADD CONSTRAINT "body_comp_face_id_fkey" FOREIGN KEY ("face_id") REFERENCES "face"("face_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_comp" ADD CONSTRAINT "body_comp_body_id_fkey" FOREIGN KEY ("body_id") REFERENCES "body"("body_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frustum" ADD CONSTRAINT "frustum_base_face_fkey" FOREIGN KEY ("base_face") REFERENCES "face"("face_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frustum" ADD CONSTRAINT "frustum_top_face_fkey" FOREIGN KEY ("top_face") REFERENCES "face"("face_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frustum" ADD CONSTRAINT "frustum_body_id_fkey" FOREIGN KEY ("body_id") REFERENCES "body"("body_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prism" ADD CONSTRAINT "prism_base_face_fkey" FOREIGN KEY ("base_face") REFERENCES "face"("face_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prism" ADD CONSTRAINT "prism_body_id_fkey" FOREIGN KEY ("body_id") REFERENCES "body"("body_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pyramid" ADD CONSTRAINT "pyramid_base_face_fkey" FOREIGN KEY ("base_face") REFERENCES "face"("face_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pyramid" ADD CONSTRAINT "pyramid_apex_fkey" FOREIGN KEY ("apex") REFERENCES "node"("node_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pyramid" ADD CONSTRAINT "pyramid_body_id_fkey" FOREIGN KEY ("body_id") REFERENCES "body"("body_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cone" ADD CONSTRAINT "cone_center_fkey" FOREIGN KEY ("center") REFERENCES "node"("node_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cone" ADD CONSTRAINT "cone_apex_fkey" FOREIGN KEY ("apex") REFERENCES "node"("node_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cone" ADD CONSTRAINT "cone_body_id_fkey" FOREIGN KEY ("body_id") REFERENCES "body"("body_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cylinder" ADD CONSTRAINT "cylinder_center_fkey" FOREIGN KEY ("center") REFERENCES "node"("node_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cylinder" ADD CONSTRAINT "cylinder_body_id_fkey" FOREIGN KEY ("body_id") REFERENCES "body"("body_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surface" ADD CONSTRAINT "surface_face_id_fkey" FOREIGN KEY ("face_id") REFERENCES "face"("face_id") ON DELETE RESTRICT ON UPDATE CASCADE;
