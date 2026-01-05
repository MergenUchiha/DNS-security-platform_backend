import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { StartSimulationDto } from './dto/simulation.dto';

@ApiTags('simulation')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new attack simulation' })
  @ApiResponse({ status: 201, description: 'Simulation started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiBody({ type: StartSimulationDto })
  startSimulation(@Body(ValidationPipe) dto: StartSimulationDto) {
    console.log('📥 [CONTROLLER] Received simulation request:', dto);
    
    // Transform DTO to match service expectations
    const config = {
      type: dto.type,
      targetDomain: dto.targetDomain,
      spoofedIP: dto.spoofedIP,
      intensity: dto.intensity,
      duration: dto.duration,
    };
    
    return this.simulationService.startSimulation(config);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a running simulation' })
  @ApiResponse({ status: 200, description: 'Simulation stopped successfully' })
  stopSimulation(@Param('id') id: string) {
    return this.simulationService.stopSimulation(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get simulation details by ID' })
  @ApiResponse({ status: 200, description: 'Simulation details retrieved' })
  getSimulation(@Param('id') id: string) {
    return this.simulationService.getSimulation(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all simulations' })
  @ApiResponse({ status: 200, description: 'Simulations list retrieved' })
  getAllSimulations() {
    return this.simulationService.getAllSimulations();
  }
}