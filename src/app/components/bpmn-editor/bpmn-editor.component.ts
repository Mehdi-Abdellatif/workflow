import { Component } from '@angular/core';
import { DiagramModule, SymbolPaletteModule, PaletteModel, NodeModel, NodeConstraints } from '@syncfusion/ej2-angular-diagrams';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bpmn-editor',
  standalone: true,
  imports: [DiagramModule, SymbolPaletteModule, FormsModule],
  templateUrl: './bpmn-editor.component.html',
  styleUrl: './bpmn-editor.component.scss'
})
export class BpmnEditorComponent {
  nodeConstraints = NodeConstraints.Default | NodeConstraints.InConnect | NodeConstraints.OutConnect | NodeConstraints.Delete;
  diagrams: any[] = [];
  selectedDiagramId: number | null = null;

  // ✅ Define BPMN Shapes
  public bpmnShapes: NodeModel[] = [
    {
      id: 'Task', width: 100, height: 100, shape: { type: 'Basic', shape: 'Ellipse' },
      style: { fill: 'rgba(144, 238, 144, 0.5)', strokeColor: 'black' },
      constraints: this.nodeConstraints,
      annotations: [{ content: 'Task', style: { color: 'black', fontSize: 12 } }]
    },
    {
      id: 'Connector', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 50, y: 50 }, type: 'Orthogonal',
      targetDecorator: { shape: 'Arrow', style: { fill: 'black' } }
    },
    {
      id: 'Condition', width: 140, height: 120, shape: { type: 'Basic', shape: 'Diamond' },
      style: { fill: 'rgba(0, 255, 255, 0.5)', strokeColor: 'black' },
      constraints: this.nodeConstraints,
      annotations: [{ content: 'Condition', style: { color: 'black', fontSize: 12 } }]
    },
  ] as NodeModel[];

  // ✅ Define Symbol Palette
  public palettes: PaletteModel[] = [
    {
      id: 'bpmn_shapes',
      expanded: true,
      symbols: this.bpmnShapes,
      title: 'Workflow Shapes',
      iconCss: 'shapes'
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch diagrams on component initialization
    this.fetchDiagrams();
  }

  fetchDiagrams(): void {
    this.http.get<any[]>('http://localhost:8080/api/bpmn/all').subscribe(
      (data) => {
        this.diagrams = data;
        console.log('Available diagrams:', data);
      },
      (error) => {
        console.error('Failed to fetch diagrams:', error);
        alert('Failed to fetch diagrams: ' + (error.message || 'Unknown error'));
      }
    );
  }

  // ✅ Fetch all diagrams
  getAllDiagrams() {
    this.http.get<any[]>('http://localhost:8080/api/bpmn/all')
      .subscribe(
        (data) => {
          this.diagrams = data;
          console.log('Available diagrams:', data);
        },
        (error) => {
          console.error('Failed to fetch diagrams:', error);
          alert('Failed to fetch diagrams: ' + (error.message || 'Unknown error'));
        }
      );
  }

  // ✅ Save the current diagram
  saveDiagram() {
    const diagram = document.getElementById('diagram') as any;
    if (diagram && diagram.ej2_instances) {
      const diagramInstance = diagram.ej2_instances[0];
      const nodes = JSON.stringify(diagramInstance.nodes);

      const diagramData = { name: 'My BPMN Diagram', nodes };
      this.http.post('http://localhost:8080/api/bpmn/save', diagramData)
        .subscribe(
          (response: any) => {
            console.log('Server response:', response);
            alert('Saved successfully: ' + response.message);
            this.getAllDiagrams(); // Refresh the list after saving
          },
          (error: any) => {
            console.error('Save failed:', error);
            alert('Failed to save: ' + (error.message || 'Unknown error'));
          }
        );
    } else {
      alert('Diagram instance not found.');
    }
  }

  // ✅ Load selected diagram
  loadDiagram() {
    if (!this.selectedDiagramId) {
      alert('Please select a diagram to load.');
      return;
    }

    this.http.get(`http://localhost:8080/api/bpmn/load/${this.selectedDiagramId}`)
      .subscribe(
        (response: any) => {
          console.log('Loaded diagram:', response);

          const diagram = document.getElementById('diagram') as any;
          if (diagram && diagram.ej2_instances) {
            const diagramInstance = diagram.ej2_instances[0];
            diagramInstance.clear();

            if (response.nodes) {
              diagramInstance.addNodes(JSON.parse(response.nodes));
              alert('Diagram loaded successfully!');
            } else {
              alert('No nodes found in the saved diagram.');
            }
          } else {
            alert('Diagram instance not found.');
          }
        },
        (error: any) => {
          console.error('Failed to load diagram:', error);
          alert('Failed to load diagram: ' + (error.message || 'Unknown error'));
        }
      );
  }
}
