import numpy as np 
import cv2
import sys
sys.path.append('../')
from utils import get_center_of_bbox, get_foot_position

class ViewTransformer():
    def __init__(self):
        court_width = 68
        court_length = 23.32

        self.pixel_vertices = np.array([[110, 1035], 
                               [265, 275], 
                               [910, 260], 
                               [1640, 915]])
        
        self.target_vertices = np.array([
            [0,court_width],
            [0, 0],
            [court_length, 0],
            [court_length, court_width]
        ])

        self.pixel_vertices = self.pixel_vertices.astype(np.float32)
        self.target_vertices = self.target_vertices.astype(np.float32)

        self.persepctive_trasnformer = cv2.getPerspectiveTransform(self.pixel_vertices, self.target_vertices)

    def transform_point(self,point):
        p = (int(point[0]),int(point[1]))
        is_inside = cv2.pointPolygonTest(self.pixel_vertices,p,False) >= 0 
        if not is_inside:
            return None

        reshaped_point = point.reshape(-1,1,2).astype(np.float32)
        tranform_point = cv2.perspectiveTransform(reshaped_point,self.persepctive_trasnformer)
        return tranform_point.reshape(-1,2)

    def add_transformed_position_to_tracks(self,tracks):
        for object, object_tracks in tracks.items():
            for frame_num, track in enumerate(object_tracks):
                for track_id, track_info in track.items():
                    if not isinstance(track_info, dict):
                        continue
                    position = track_info.get('position_adjusted') or track_info.get('position')
                    if not position:
                        bbox = track_info.get('bbox')
                        if not bbox or bbox[0] is None:
                            continue
                        position = get_center_of_bbox(bbox) if object == 'ball' else get_foot_position(bbox)
                    position = np.array(position)
                    position_trasnformed = self.transform_point(position)
                    if position_trasnformed is not None:
                        position_trasnformed = position_trasnformed.squeeze().tolist()
                        tracks[object][frame_num][track_id]['position_transformed'] = position_trasnformed
                    else:
                        tracks[object][frame_num][track_id]['position_transformed'] = position.tolist()
