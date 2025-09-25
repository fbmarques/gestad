<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $events = Event::orderBy('nome', 'asc')->get();

        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create($request->validated());

        return response()->json($event, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $event->update($request->validated());

        return response()->json($event);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $event->delete();

        return response()->json(['message' => 'Evento excluído com sucesso.']);
    }

    /**
     * Display a listing of the trashed events.
     */
    public function trashed(): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $trashedEvents = Event::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'nome' => $event->nome,
                    'alias' => $event->alias,
                    'tipo' => $event->tipo,
                    'natureza' => $event->natureza,
                    'dataExclusao' => $event->deleted_at->format('d/m/Y H:i:s'),
                ];
            });

        return response()->json($trashedEvents);
    }

    /**
     * Restore the specified trashed event.
     */
    public function restore(string $id): JsonResponse
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('role_id', [1, 2])->exists()) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        $event = Event::onlyTrashed()->findOrFail($id);
        $event->restore();

        return response()->json(['message' => 'Evento restaurado com sucesso.']);
    }
}
