export default function Toolbar({
  drawMode,
  setDrawMode,
  annotationMode,
  setAnnotationMode,
  selectedAnnotationType,
  setSelectedAnnotationType,
  tracking,
  onStartGps,
  onStopGps,
  onStartSimulation,
  onStopSimulation
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={drawMode ? 'active' : ''}
          onClick={() => setDrawMode(!drawMode)}
        >
          {drawMode ? 'Finish Route Drawing' : 'Draw Route'}
        </button>
      </div>

      <div className="toolbar-group">
        <button
          className={annotationMode ? 'active' : ''}
          onClick={() => setAnnotationMode(!annotationMode)}
        >
          {annotationMode ? 'Stop Adding Annotation' : 'Add Annotation'}
        </button>

        {annotationMode && (
          <select
            value={selectedAnnotationType}
            onChange={(e) => setSelectedAnnotationType(e.target.value)}
          >
            <option value="obstacle">Obstacle</option>
            <option value="crossing">Crossing</option>
            <option value="hazard">Hazard</option>
            <option value="portage">Portage</option>
            <option value="lock_weir">Lock/Weir</option>
            <option value="current_note">Current Note</option>
            <option value="flow_note">Flow Note</option>
          </select>
        )}
      </div>

      <div className="toolbar-group">
        {!tracking.gpsActive ? (
          <button onClick={onStartGps}>Start GPS</button>
        ) : (
          <button className="danger" onClick={onStopGps}>Stop GPS</button>
        )}

        {!tracking.simActive ? (
          <button onClick={onStartSimulation}>Simulate Track</button>
        ) : (
          <button className="danger" onClick={onStopSimulation}>Stop Simulation</button>
        )}
      </div>
    </div>
  )
}
